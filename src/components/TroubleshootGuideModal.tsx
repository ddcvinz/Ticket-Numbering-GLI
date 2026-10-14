import React from 'react';
import { X, HelpCircle, Printer, Wifi, Laptop, Camera, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TroubleshootGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TroubleshootGuideModal: React.FC<TroubleshootGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <div>
              <h4 className="font-bold text-sm">Quick Self-Help Troubleshooting</h4>
              <p className="text-[11px] text-slate-400">Try these fast checks while waiting for the IT Officer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          {/* Printer */}
          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
              <Printer className="w-4 h-4 text-blue-700" />
              <span>Printer Paper Jam or Blinking Red Light</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
              <li>Turn off printer power button before pulling any jammed paper.</li>
              <li>Always pull paper gently in the direction of the paper path (do not rip paper in the rollers).</li>
              <li>Verify the USB cable is firmly inserted or check if Wi-Fi printer light is solid blue.</li>
              <li>Check ink tank levels—if low, do not run deep head cleaning without ink.</li>
            </ul>
          </div>

          {/* Internet / Wi-Fi */}
          <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
              <Wifi className="w-4 h-4 text-rose-700" />
              <span>Internet Disconnected / PLDT or Globe Outage Check</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
              <li>Check the optical modem: If the <strong>LOS light is blinking RED</strong>, the fiber cable is cut outside and IT will coordinate with PLDT/Globe.</li>
              <li>If the <strong>PON light is solid GREEN</strong>, internet is active! Unplug modem power cord for 30 seconds and plug back in.</li>
              <li>Ensure the blue or yellow LAN cable clicks securely into your PC’s network port.</li>
            </ul>
          </div>

          {/* Computer / Laptop */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
              <Laptop className="w-4 h-4 text-emerald-700" />
              <span>Computer Freezing or Slow</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
              <li>Press <strong>Ctrl + Shift + Esc</strong> to open Task Manager and check if disk or memory is at 100%.</li>
              <li>Save all open spreadsheets and restart your PC (do not just put it to sleep).</li>
              <li>Check if the VGA/HDMI monitor cable is loose on the CPU back panel.</li>
            </ul>
          </div>

          {/* CCTV */}
          <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-purple-900">
              <Camera className="w-4 h-4 text-purple-700" />
              <span>CCTV Camera Video Loss</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
              <li>Check if the PoE switch power light is ON for that specific camera port.</li>
              <li>Ensure the power supply adapter for the DVR/NVR is plugged into the UPS (battery backup).</li>
              <li>Note which specific channel number (e.g. Cam 04 or Cam 05) is black.</li>
            </ul>
          </div>

          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-center">
            <p className="font-semibold text-slate-800">
              Still having trouble? Your ticket is safe in the queue!
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              The IT Officer will inspect your unit according to the fair queue order.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
