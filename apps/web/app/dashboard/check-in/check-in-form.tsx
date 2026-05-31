"use client";

import { FormEvent, useRef, useState } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { CheckCircle2, CircleAlert, Camera, Search, Square } from "lucide-react";
import { useApiAuthToken } from "@/components/auth-token-context";
import { checkInTicket, type CheckInResult } from "@/features/checkins/api";
import type { DashboardEvent } from "@/features/dashboard/api";
import { formatEventDate } from "@/lib/format";

type CheckInFormProps = {
  events: DashboardEvent[];
};

export function CheckInForm({ events }: CheckInFormProps) {
  const { getToken } = useApiAuthToken();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);
  const lastScannedCodeRef = useRef<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id ?? "");
  const [ticketCode, setTicketCode] = useState("");
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerMessage, setScannerMessage] = useState<string | null>(null);

  async function submitTicketCode(code: string) {
    setError(null);
    setResult(null);

    if (!selectedEventId) {
      setError("Choose an event before checking in tickets.");
      return;
    }

    setIsChecking(true);

    try {
      const authToken = await getToken();
      const response = await checkInTicket(code, selectedEventId, authToken);
      setResult(response);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to check in ticket");
    } finally {
      setIsChecking(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitTicketCode(ticketCode);
  }

  async function startScanner() {
    setError(null);
    setScannerMessage(null);

    if (!videoRef.current) {
      return;
    }

    try {
      const reader = new BrowserQRCodeReader();
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (scanResult) => {
          const code = scanResult?.getText()?.trim();

          if (!code || code === lastScannedCodeRef.current) {
            return;
          }

          lastScannedCodeRef.current = code;
          setTicketCode(code);
          stopScanner();
          void submitTicketCode(code);
        }
      );

      scannerControlsRef.current = controls;
      setIsScanning(true);
      setScannerMessage("Point the camera at a LocalShow ticket QR code.");
    } catch (caught) {
      setScannerMessage(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Camera scanning is unavailable on this device or browser."
      );
    }
  }

  function stopScanner() {
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    setIsScanning(false);
  }

  const isSuccess = result?.result === "SUCCESS";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <section className="space-y-6">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black tracking-tight">Event at the door</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Pick the event you are staffing. LocalShow will reject valid tickets from other events.
          </p>
          <label className="mt-5 grid gap-2 text-sm font-semibold text-zinc-800">
            Event
            <select
              value={selectedEventId}
              onChange={(event) => setSelectedEventId(event.target.value)}
              disabled={events.length === 0 || isChecking || isScanning}
              className="rounded-md border border-zinc-300 px-3 py-3 text-base font-bold outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500"
            >
              {events.length === 0 ? <option value="">No organizer events yet</option> : null}
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} · {formatEventDate(event.startsAt)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight">QR scanner</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Scan a ticket QR code at the door. The code is checked immediately after a scan.
              </p>
            </div>
            <button
              type="button"
              onClick={isScanning ? stopScanner : startScanner}
              disabled={isChecking || !selectedEventId}
              className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-70"
            >
              {isScanning ? <Square className="size-4" /> : <Camera className="size-4" />}
              {isScanning ? "Stop scanner" : "Start scanner"}
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950">
            <video
              ref={videoRef}
              muted
              playsInline
              className="aspect-video w-full object-cover"
            />
          </div>

          {scannerMessage ? (
            <p className="mt-3 text-sm font-semibold text-zinc-600">{scannerMessage}</p>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black tracking-tight">Manual ticket lookup</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Paste a ticket code from the fan wallet if camera scanning is unavailable.
          </p>
          <label className="mt-5 grid gap-2 text-sm font-semibold text-zinc-800">
            Ticket code
            <input
              name="ticketCode"
              required
              value={ticketCode}
              onChange={(event) => setTicketCode(event.target.value)}
              placeholder="LS-TK-ABC12345"
              className="rounded-md border border-zinc-300 px-3 py-3 font-mono text-lg uppercase tracking-wide outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>
          <button
            type="submit"
            disabled={isChecking || !selectedEventId}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-70"
          >
            <Search className="size-4" />
            {isChecking ? "Checking..." : "Check in ticket"}
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black tracking-tight">Result</h2>
        {!result && !error ? (
          <p className="mt-4 text-sm leading-6 text-zinc-600">
            Check-in results will appear here with ticket, event, and location details.
          </p>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        {result ? (
          <div
            className={`mt-4 rounded-md border p-4 ${
              isSuccess ? "border-teal-200 bg-teal-50" : "border-amber-200 bg-amber-50"
            }`}
          >
            <div className="flex items-start gap-3">
              {isSuccess ? (
                <CheckCircle2 className="mt-0.5 size-5 text-teal-700" />
              ) : (
                <CircleAlert className="mt-0.5 size-5 text-amber-700" />
              )}
              <div>
                <p className={`text-sm font-black ${isSuccess ? "text-teal-800" : "text-amber-800"}`}>
                  {result.result.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-sm text-zinc-700">{result.message}</p>
              </div>
            </div>

            {result.ticket ? (
              <div className="mt-4 space-y-2 border-t border-black/10 pt-4 text-sm text-zinc-700">
                <p className="font-black text-zinc-950">{result.ticket.event.title}</p>
                <p>{result.ticket.ticketType.name}</p>
                <p>{formatEventDate(result.ticket.event.startsAt)}</p>
                <p>
                  {result.ticket.event.venue.name}, {result.ticket.event.venue.city},{" "}
                  {result.ticket.event.venue.state}
                </p>
                <p className="font-mono font-bold tracking-wide">{result.ticket.code}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
