import Image from "next/image";
import QRCode from "qrcode";

type TicketQrCodeProps = {
  code: string;
  size?: number;
};

export async function TicketQrCode({ code, size = 192 }: TicketQrCodeProps) {
  const qrDataUrl = await QRCode.toDataURL(code, {
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 8,
    color: {
      dark: "#18181b",
      light: "#ffffff"
    }
  });

  return (
    <div className="mx-auto w-full rounded-md border border-zinc-200 bg-white p-3" style={{ maxWidth: size }}>
      <Image
        src={qrDataUrl}
        alt={`QR code for ticket ${code}`}
        width={size}
        height={size}
        unoptimized
        className="h-auto w-full"
      />
    </div>
  );
}
