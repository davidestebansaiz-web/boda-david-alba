export interface QrCodeGenerator {
  generateSvg(value: string): Promise<string>;
}

