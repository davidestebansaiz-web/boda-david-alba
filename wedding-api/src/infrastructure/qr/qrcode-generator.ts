import QRCode from "qrcode";

import type { QrCodeGenerator } from "../../application/ports/qr-code-generator";

export class QrCodeSvgGenerator implements QrCodeGenerator {
  async generateSvg(value: string): Promise<string> {
    return QRCode.toString(value, { type: "svg", errorCorrectionLevel: "M", margin: 1 });
  }
}

