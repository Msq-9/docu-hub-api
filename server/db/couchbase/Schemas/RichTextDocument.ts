export type RichTextDocument = {
  id: string;
  title: string;
  documentJSON: string;
  sharedTo: string[];
  isPublic: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: number;
  updatedAt?: number;
};
