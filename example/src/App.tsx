import { useQuery, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useRef } from "react";

function App() {
  const files = useQuery(api.functions.listFiles);
  const uploadFile = useAction(api.functions.uploadFile);
  const deleteFile = useAction(api.functions.deleteFile);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    const input = fileInputRef.current;
    if (!input?.files?.length) return;

    const file = input.files[0];
    setUploading(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      await uploadFile({
        fileName: file.name,
        fileData: base64,
        contentType: file.type || undefined,
        path: "uploads",
      });

      input.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      await deleteFile({ key });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20, fontFamily: "system-ui" }}>
      <h1>Bunny Storage Demo</h1>
      <p style={{ color: "#666" }}>
        Upload files to Bunny.net CDN via Convex component
      </p>

      <div style={{ marginBottom: 24, padding: 16, border: "2px dashed #ccc", borderRadius: 8 }}>
        <input
          ref={fileInputRef}
          type="file"
          disabled={uploading}
          style={{ marginBottom: 8 }}
        />
        <br />
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{
            padding: "8px 16px",
            background: uploading ? "#ccc" : "#FF6600",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        >
          {uploading ? "Uploading..." : "Upload to Bunny"}
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, background: "#fee", color: "#c00", borderRadius: 4, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <h2>Files ({files?.length ?? 0})</h2>

      {files === undefined ? (
        <p>Loading...</p>
      ) : files.length === 0 ? (
        <p style={{ color: "#999" }}>No files uploaded yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #eee" }}>
              <th style={{ textAlign: "left", padding: 8 }}>File</th>
              <th style={{ textAlign: "left", padding: 8 }}>Type</th>
              <th style={{ textAlign: "right", padding: 8 }}>Size</th>
              <th style={{ textAlign: "center", padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>
                  <a
                    href={file.cdnUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0066cc" }}
                  >
                    {file.fileName}
                  </a>
                </td>
                <td style={{ padding: 8, color: "#666" }}>
                  {file.contentType ?? "—"}
                </td>
                <td style={{ padding: 8, textAlign: "right", color: "#666" }}>
                  {file.size ? formatBytes(file.size) : "—"}
                </td>
                <td style={{ padding: 8, textAlign: "center" }}>
                  <button
                    onClick={() => copyUrl(file.cdnUrl)}
                    style={{ marginRight: 8, cursor: "pointer", padding: "4px 8px" }}
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => handleDelete(file.key)}
                    style={{ cursor: "pointer", padding: "4px 8px", color: "#c00" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default App;
