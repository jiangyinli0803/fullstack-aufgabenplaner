export interface Comment {
    id: number;
    task_title: string;
    task_id: number;
    text: string;
    author_id: number;
    author_name: string;
    is_edited: boolean;
    created_at: string;
    updated_at: string;
}
