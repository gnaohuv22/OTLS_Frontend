declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
  }
  
  function parse(dataBuffer: Buffer | Uint8Array, options?: any): Promise<PDFData>;
  
  export = parse;
}

declare module 'mammoth' {
  interface ExtractResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }
  
  interface MammothOptions {
    arrayBuffer: ArrayBuffer;
  }
  
  function extractRawText(options: MammothOptions): Promise<ExtractResult>;
  
  export = {
    extractRawText,
  };
} 