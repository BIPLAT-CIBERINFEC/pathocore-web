import { useEffect, useState } from "react";
import { Surface, SectionHeading } from "@/components/mepram/MepramPrimitives";
import { useAuth } from "hooks/use-auth";
import {
  Users,
  CheckCircle2,
  XCircle,
  Ban,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccessDecisionNoteDialog } from "./AccessDecisionNoteDialog";

interface AccessRequest {
  id: number | string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  requested_use_case: string;
  requested_role: string;
  message: string;
  status: "pending" | "approved" | "rejected" | "revoked";
  created_at?: string;
}

type RequestStatus = "pending" | "approved" | "rejected" | "revoked";
type ReviewAction = "reject" | "revoke";

interface PendingReviewAction {
  id: number | string;
  action: ReviewAction;
  requestLabel: string;
}

export function MepramAdminRequests() {
  const { accessToken } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<RequestStatus>("pending");
  const [pendingReviewAction, setPendingReviewAction] =
    useState<PendingReviewAction | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "/api/pathocore/v1";

  const fetchRequests = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${baseUrl}/access-requests?status=${activeTab}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error al obtener las solicitudes");

      const data = await response.json();
      setRequests(data.items || data);
    } catch (err: any) {
      setError(err.message || "No se pudieron cargar las peticiones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRequests();
  }, [accessToken, activeTab]);

  const handleAction = async (
    id: number | string,
    action: "approve" | "reject" | "revoke",
    reviewNoteOverride?: string
  ) => {
    if (!accessToken) return;

    const reviewNoteMap = {
      approve: "Approved from MEPRAM intranet.",
      reject: "Rejected from MEPRAM intranet.",
      revoke: "Access revoked from MEPRAM intranet.",
    };
    const reviewNote =
      action === "approve"
        ? reviewNoteMap.approve
        : reviewNoteOverride || "";

    if ((action === "reject" || action === "revoke") && !reviewNote.trim()) {
      return;
    }

    setProcessingId(id);

    try {
      const response = await fetch(
        `${baseUrl}/access-requests/${id}/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ review_note: reviewNote.trim() }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Error al procesar la acción '${action}'`
        );
      }

      setRequests((prev) => prev.filter((req) => req.id !== id));
      setPendingReviewAction(null);
      setReviewNote("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const openReviewDialog = (request: AccessRequest, action: ReviewAction) => {
    setPendingReviewAction({
      id: request.id,
      action,
      requestLabel: `#${request.id} - ${request.first_name} ${request.last_name} (${request.email})`,
    });
    setReviewNote("");
  };

  const closeReviewDialog = () => {
    if (processingId) return;
    setPendingReviewAction(null);
    setReviewNote("");
  };

  const submitReviewAction = () => {
    if (!pendingReviewAction) return;
    void handleAction(
      pendingReviewAction.id,
      pendingReviewAction.action,
      reviewNote
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Surface className="p-6 space-y-6">
        <SectionHeading
          title="Gestión de Accesos"
          description="Administra y audita las solicitudes de acceso para el entorno MEPRAM."
          action={
            <Badge
              variant="secondary"
              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold"
            >
              {requests.length} {activeTab}
            </Badge>
          }
        />

        <div className="flex border-b border-slate-200 gap-2">
          {(
            ["pending", "approved", "rejected", "revoked"] as RequestStatus[]
          ).map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === status
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center min-h-[300px] space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
              Cargando solicitudes...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 border border-red-100 bg-red-50/50 rounded-[24px] flex flex-col items-center justify-center min-h-[250px] text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              Error de Conexión
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md">{error}</p>
            <Button
              onClick={() => void fetchRequests()}
              className="mt-6 flex items-center gap-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70">
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      ID / Usuario
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Contacto
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Rol Solicitado
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Motivo
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.length > 0 ? (
                    requests.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">
                              #{req.id} - {req.first_name} {req.last_name}
                            </span>
                            <span className="text-xs text-slate-500 font-mono mt-0.5">
                              @{req.username}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {req.email}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 uppercase">
                            {req.requested_role}
                          </span>
                        </td>
                        <td
                          className="p-4 text-sm text-slate-600 max-w-xs truncate"
                          title={req.message}
                        >
                          {req.message || "Sin motivo especificado."}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">

                            {activeTab === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  disabled={processingId === req.id}
                                  onClick={() => openReviewDialog(req, "reject")}
                                >
                                  {processingId === req.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Rechazar
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-8 bg-emerald-600 text-white hover:bg-emerald-700"
                                  disabled={processingId === req.id}
                                  onClick={() =>
                                    handleAction(req.id, "approve")
                                  }
                                >
                                  {processingId === req.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                  )}
                                  Aprobar
                                </Button>
                              </>
                            )}

                            {activeTab === "approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                                disabled={processingId === req.id}
                                onClick={() => openReviewDialog(req, "revoke")}
                              >
                                {processingId === req.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Ban className="h-4 w-4 mr-1" />
                                )}
                                Revocar Acceso
                              </Button>
                            )}

                            {(activeTab === "rejected" ||
                              activeTab === "revoked") && (
                              <span className="text-xs text-slate-400 italic">
                                Sin acciones disponibles
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-16 text-center text-sm text-slate-400 font-medium"
                      >
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <Users className="h-8 w-8 text-slate-300" />
                          <p>No hay solicitudes en estado '{activeTab}'.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Surface>
      {pendingReviewAction && (
        <AccessDecisionNoteDialog
          action={pendingReviewAction.action}
          requestLabel={pendingReviewAction.requestLabel}
          note={reviewNote}
          processing={processingId === pendingReviewAction.id}
          onNoteChange={setReviewNote}
          onCancel={closeReviewDialog}
          onConfirm={submitReviewAction}
        />
      )}
    </div>
  );
}
