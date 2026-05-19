import Image from "next/image";
import QRCode from "qrcode";

type TicketQrCodeProps = {
  code: string;
};

export async function TicketQrCode({ code }: TicketQrCodeProps) {
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
    <div className="mx-auto w-full max-w-48 rounded-md border border-zinc-200 bg-white p-3">
      <Image
        src={qrDataUrl}
        alt={`QR code for ticket ${code}`}
        width={192}
        height={192}
        unoptimized
        className="h-auto w-full"
      />
    </div>
  );
}
