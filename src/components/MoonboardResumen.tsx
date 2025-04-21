import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Registro = {
  fecha: string;
  emociones: string;
  energia: number;
  creatividad: number;
  espiritualidad: number;
  notas: string;
};

export default function MoonboardResumen() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const refToExport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .order("fecha", { ascending: true });

      if (!error && data) {
        setRegistros(data as Registro[]);
      }
    };

    fetchData();
  }, []);

  const handleExportPDF = async () => {
    const input = refToExport.current;
    if (!input) return;

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("mi-moonboard.pdf");
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg mt-8">
      <h2 className="text-2xl font-bold text-pink-700 mb-4">
        📝 Mi Resumen Lunar
      </h2>

      <div ref={refToExport} className="space-y-4 printable">
        {registros.map((r, index) => (
          <div key={index} className="border-l-4 border-pink-400 pl-4">
            <p className="text-sm text-gray-600">
              📅 {new Date(r.fecha).toLocaleDateString()}
            </p>
            <p className="font-medium text-pink-800">
              💫 Emociones: {r.emociones}
            </p>
            <p className="text-sm">💡 Notas: {r.notas}</p>
            <p className="text-xs mt-1 text-gray-500">
              🔋 Energía: {r.energia} · 🎨 Creatividad: {r.creatividad} · ✨
              Espiritualidad: {r.espiritualidad}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={handleExportPDF}
        className="mt-6 bg-pink-600 text-white px-4 py-2 rounded shadow hover:bg-pink-700 transition"
      >
        📥 Descargar como PDF
      </button>
    </div>
  );
}
