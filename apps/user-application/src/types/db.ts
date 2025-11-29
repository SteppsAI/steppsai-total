export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Folder {
    id: string;
    userId: string;
    name: string;
    createdAt?: string;
}

export interface FolderWithCount extends Folder {
    guideCount: number;
}

export interface Guide {
    id: string;
    userId: string;
    folderId?: string | null;
    title?: string | null;
    description?: string | null;
    slug: string;
    status?: string | null;
    visibility?: string | null;
    steps?: Step[];
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface GuideWithFolder extends Guide {
    folderName?: string | null;
}

export interface Step {
    id: string;
    orderIndex: number;
    imageKey: string;
    pageUrl: string;
    domSelector: string;
    caption: string;
    aiCaption?: string;
    overlays?: Overlay[];
    isExcluded?: boolean;
}

// Annotation types matching the editor canvas
export interface ArrowAnnotation {
    id: string;
    type: 'arrow';
    points: [number, number, number, number]; // x1, y1, x2, y2
    color: string;
    strokeWidth: number;
}

export interface CircleAnnotation {
    id: string;
    type: 'circle';
    x: number;
    y: number;
    radius: number;
    color: string;
    strokeWidth: number;
}

export interface HideAnnotation {
    id: string;
    type: 'hide';
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

export type Overlay = ArrowAnnotation | CircleAnnotation | HideAnnotation;

export interface NotificationPreferences {
    newsletter: boolean;
}

export interface User {
    userId: string;
    email: string | null;
    name: string | null;
    avatarUrl?: string | null;
    notificationPreferences?: NotificationPreferences | null;
    createdAt?: string | null;
}

export interface Subscription {
    id: string;
    userId: string;
    stripeCustomerId: string | null;
    planType: string | null;
    status: string | null;
    maxEditors: number | null;
    currentPeriodEnd: string | null;
}

export interface TeamMember {
    id: string;
    ownerId: string;
    memberId: string;
    role: string | null;
    status: string | null;
    createdAt?: string | null;
}

export interface Export {
    id: string;
    guideId: string;
    type: string | null;
    fileUrl: string | null;
    status: string | null;
    createdAt?: string | null;
}
