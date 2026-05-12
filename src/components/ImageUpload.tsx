import { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '../api/endpoints';
import { absUrl, errorMessage } from '../api/client';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = 'Rasm',
  hint = 'URL kiriting yoki "Fayl yuklash"',
}: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const url = await uploadImage(f);
      onChange(url);
      toast.success('Rasm yuklandi');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-start gap-3">
        <div className="w-20 h-20 rounded-lg bg-panel border border-border overflow-hidden flex items-center justify-center shrink-0">
          {value ? (
            <img
              src={absUrl(value)}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
            />
          ) : (
            <ImageIcon className="text-muted" size={28} />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={hint}
              className="input pr-8"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="btn-outline text-xs"
          >
            {busy ? (
              <>
                <div className="h-3 w-3 rounded-full border border-gold border-t-transparent animate-spin" />
                Yuklanmoqda...
              </>
            ) : (
              <>
                <Upload size={14} /> Fayl yuklash
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFile}
          />
        </div>
      </div>
    </div>
  );
}
