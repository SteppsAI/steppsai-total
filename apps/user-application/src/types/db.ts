export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Folder {
    id: string; // uuid
    user_id: string; // uuid
    name: string;
    created_at: string; // timestamp
}

export interface Guide {
    id: string; // uuid
    user_id: string; // uuid
    folder_id: string | null; // uuid
    title: string | null;
    description: string | null;
    slug: string;
    status: string | null;
    visibility: string | null;
    created_at: string | null; // timestamp
    updated_at: string | null; // timestamp
}

export interface User {
    id: string; // uuid
    email: string; // NOT NULL in schema
    full_name: string | null;
    avatar_url: string | null;
    created_at: string | null; // timestamp
}

export interface Subscription {
    id: string; // text
    user_id: string; // uuid
    stripe_customer_id: string | null;
    plan_type: string | null;
    status: string | null;
    max_editors: number | null; // integer
    current_period_end: string | null; // timestamp
}

export interface Step {
    id: string; // uuid
    guide_id: string; // uuid
    order_index: number; // float
    screenshot_url: string | null;
    page_url: string | null;
    dom_selector: string | null;
    ai_caption: string | null;
    final_caption: string | null;
    overlays: Json | null; // jsonb
    is_excluded: boolean | null;
}

export interface TeamMember {
    id: string; // uuid
    owner_id: string; // uuid
    member_id: string; // uuid
    role: string | null;
    status: string | null;
    created_at: string | null; // timestamp
}

export interface Export {
    id: string; // uuid
    guide_id: string; // uuid
    type: string | null;
    file_url: string | null;
    status: string | null;
    created_at: string | null; // timestamp
}
