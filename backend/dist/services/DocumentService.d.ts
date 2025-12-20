export declare class DocumentService {
    processDocument(rfpId: string, file: Express.Multer.File): Promise<{
        path: string;
        chunksCreated: number;
    }>;
    private saveFile;
    private extractText;
    private chunkDocument;
    private isSectionHeader;
    private detectSectionType;
}
export default DocumentService;
