export declare class DocumentService {
    processDocument(rfpId: string, file: Express.Multer.File): Promise<{
        path: string;
        chunksCreated: number;
    }>;
    private saveFile;
    private extractText;
}
export default DocumentService;
