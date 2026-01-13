/**
 * Server-side Word document generation for guide exports
 * Generates a .docx document with embedded images
 */
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    ImageRun,
    HeadingLevel,
    AlignmentType,
    PageBreak,
    BorderStyle,
    Table,
    TableRow,
    TableCell,
    WidthType,
    TableBorders,
    VerticalAlign,
} from 'docx';
import type { Guide, Step, ImageDataResult } from '@repo/data-ops/zod-schema';

/**
 * Generates a complete Word document for export
 * @param guide - Guide data with steps
 * @param imageMap - Map of stepId to base64 data URL with aspect ratio
 * @returns Buffer containing the .docx file
 */
export async function generateExportDocx(
    guide: Guide,
    imageMap: Record<string, ImageDataResult>
): Promise<Uint8Array> {
    const steps = (guide.steps || []) as Step[];
    const visibleSteps = steps
        .filter((step) => !step.isExcluded)
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

    // Build document sections - using (Paragraph | Table)[] type
    const children: (Paragraph | Table)[] = [];

    // Title page
    children.push(
        new Paragraph({
            children: [new TextRun({ text: '', break: 5 })], // Spacing
        }),
        new Paragraph({
            text: guide.title || 'Untitled Guide',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        })
    );

    if (guide.description) {
        children.push(
            new Paragraph({
                text: guide.description,
                alignment: AlignmentType.CENTER,
                style: 'Normal',
                spacing: { after: 400 },
            })
        );
    }

    // Page break after title
    children.push(
        new Paragraph({
            children: [new PageBreak()],
        })
    );

    // Steps
    for (let index = 0; index < visibleSteps.length; index++) {
        const step = visibleSteps[index];
        const caption = step.caption || step.aiCaption || `Step ${index + 1}`;
        const imageEntry = imageMap[step.id];

        const imageType = imageEntry?.dataUrl ? getImageTypeFromDataUrl(imageEntry.dataUrl) : null;
        // Only consider image valid if we have the data AND format is supported by docx
        const hasImage = !!(step.imageKey && imageEntry?.dataUrl && imageType);
        const isLastStep = index === visibleSteps.length - 1;

        if (hasImage) {
            // For steps WITH images: Use a table to keep caption + image together
            // Tables in Word stay together on the same page by default
            try {
                const imageBuffer = base64ToBuffer(imageEntry.dataUrl);
                const aspectRatio = imageEntry.aspectRatio || 16 / 9;

                const maxWidth = 550; // Slightly smaller to fit in table cell
                const width = maxWidth;
                const height = Math.round(width / aspectRatio);

                // Create a borderless table with caption row + image row
                const stepTable = new Table({
                    rows: [
                        // Caption row
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: [
                                                new TextRun({
                                                    text: `${index + 1}. `,
                                                    bold: true,
                                                    size: 40, // 20pt
                                                    color: '6366F1', // Primary color
                                                    font: 'Segoe UI',
                                                }),
                                                new TextRun({
                                                    text: caption,
                                                    bold: true,
                                                    size: 40, // 20pt
                                                    font: 'Segoe UI',
                                                    color: '111827', // Gray-900
                                                }),
                                            ],
                                            alignment: AlignmentType.CENTER,
                                            spacing: { before: 100, after: 150 },
                                        }),
                                    ],
                                    verticalAlign: VerticalAlign.CENTER,
                                    borders: {
                                        top: { style: BorderStyle.NONE, size: 0 },
                                        bottom: { style: BorderStyle.NONE, size: 0 },
                                        left: { style: BorderStyle.NONE, size: 0 },
                                        right: { style: BorderStyle.NONE, size: 0 },
                                    },
                                }),
                            ],
                        }),
                        // Image row
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: [
                                                new ImageRun({
                                                    data: imageBuffer,
                                                    transformation: { width, height },
                                                    type: imageType,
                                                }),
                                            ],
                                            alignment: AlignmentType.CENTER,
                                            spacing: { before: 100, after: 100 },
                                        }),
                                    ],
                                    verticalAlign: VerticalAlign.CENTER,
                                    borders: {
                                        top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
                                        bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
                                        left: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
                                        right: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
                                    },
                                }),
                            ],
                        }),
                    ],
                    width: {
                        size: 100,
                        type: WidthType.PERCENTAGE,
                    },
                    borders: {
                        top: { style: BorderStyle.NONE, size: 0 },
                        bottom: { style: BorderStyle.NONE, size: 0 },
                        left: { style: BorderStyle.NONE, size: 0 },
                        right: { style: BorderStyle.NONE, size: 0 },
                        insideHorizontal: { style: BorderStyle.NONE, size: 0 },
                        insideVertical: { style: BorderStyle.NONE, size: 0 },
                    },
                });

                children.push(stepTable);
            } catch (error) {
                console.error(`Failed to embed image for step ${step.id}:`, error);
                // Fallback: just caption + error message
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `${index + 1}. `,
                                bold: true,
                                size: 40,
                                color: '6366F1',
                                font: 'Segoe UI',
                            }),
                            new TextRun({
                                text: caption,
                                bold: true,
                                size: 40,
                                font: 'Segoe UI',
                                color: '111827',
                            }),
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 200, after: 200 },
                    }),
                    new Paragraph({
                        text: '[Image could not be loaded]',
                        alignment: AlignmentType.CENTER,
                        style: 'Normal',
                    })
                );
            }

            // Page break after image step (unless last)
            if (!isLastStep) {
                children.push(
                    new Paragraph({
                        children: [new PageBreak()],
                    })
                );
            }

        } else {
            // Text-only steps: Use simple paragraph
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${index + 1}. `,
                            bold: true,
                            size: 40, // 20pt
                            color: '6366F1', // Primary color
                            font: 'Segoe UI',
                        }),
                        new TextRun({
                            text: caption,
                            bold: true,
                            size: 40, // 20pt
                            font: 'Segoe UI',
                            color: '111827', // Gray-900
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 400, after: 300 },
                })
            );

            // Check if next step has image - if so, add page break
            const nextStep = visibleSteps[index + 1];
            const nextHasImage = nextStep ? !!(nextStep.imageKey && imageMap[nextStep.id]?.dataUrl) : false;

            if (!isLastStep && nextHasImage) {
                children.push(
                    new Paragraph({
                        children: [new PageBreak()],
                    })
                );
            }
        }
    }

    // Create document
    const doc = new Document({
        title: guide.title || 'Untitled Guide',
        description: guide.description || '',
        creator: 'Stepps.ai',
        styles: {
            default: {
                document: {
                    run: {
                        font: 'Segoe UI',
                        size: 24, // 12pt
                        color: '374151', // Gray-700
                    },
                },
                heading1: {
                    run: {
                        font: 'Segoe UI',
                        size: 48, // 24pt
                        bold: true,
                        color: '111827', // Gray-900
                    },
                },
                title: {
                    run: {
                        font: 'Segoe UI',
                        size: 64, // 32pt
                        bold: true,
                        color: '111827',
                    },
                },
            },
        },
        sections: [
            {
                children,
            },
        ],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);
    return new Uint8Array(buffer);
}

/**
 * Converts base64 data URL to Buffer for docx embedding
 */
function base64ToBuffer(dataUrl: string): Buffer {
    // Remove data URL prefix (e.g., "data:image/png;base64,")
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
}

/**
 * Extracts image type from data URL for docx embedding
 * docx only supports: png, gif, jpg, bmp
 * Returns null if format is unsupported (e.g., webp)
 */
function getImageTypeFromDataUrl(dataUrl: string): 'png' | 'gif' | 'jpg' | 'bmp' | null {
    const match = dataUrl.match(/^data:image\/(\w+);base64,/);
    if (!match) return null;

    const mimeType = match[1].toLowerCase();

    // Map mime types to docx supported types
    if (mimeType === 'png') return 'png';
    if (mimeType === 'gif') return 'gif';
    if (mimeType === 'jpeg' || mimeType === 'jpg') return 'jpg';
    if (mimeType === 'bmp') return 'bmp';

    // webp and other formats are NOT supported by docx
    return null;
}
