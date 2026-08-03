import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surface, SectionHeading } from "@/components/mepram/MepramPrimitives";

interface CatalogItem {
  name: string;
  label: string;
  roles: string[];
}

interface AccessRequestItem {
  requested_use_case: string;
  requested_role: string;
}

interface AccessRequestPayload {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  requests: AccessRequestItem[];
  message: string;
}

export default function SignInPage() {
  const [formData, setFormData] = useState<AccessRequestPayload>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    requests: [{ requested_use_case: "", requested_role: "" }],
    message: "",
  });

  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/pathocore/v1";

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await fetch(`${baseUrl}/access-requests/catalog`);
        if (!response.ok) throw new Error("Error loading catalog options");

        const data: CatalogItem[] = await response.json();
        setCatalog(data);

        if (data && data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            requests: [
              {
                requested_use_case: data[0].name,
                requested_role: data[0].roles[0] || "view",
              },
            ],
          }));
        }
      } catch (error) {
        console.error("Catalog fetch error:", error);
        setErrorMessage(
          "Failed to load environments catalog. Please try again later."
        );
      } finally {
        setIsLoadingCatalog(false);
      }
    };

    void fetchCatalog();
  }, [baseUrl]);

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUseCaseChange = (index: number, selectedUseCase: string) => {
    const catalogItem = catalog.find((item) => item.name === selectedUseCase);
    const defaultRole = catalogItem?.roles[0] || "view";

    setFormData((prev) => {
      const newRequests = [...prev.requests];
      newRequests[index] = {
        requested_use_case: selectedUseCase,
        requested_role: defaultRole,
      };
      return { ...prev, requests: newRequests };
    });
  };

  const handleRoleChange = (index: number, selectedRole: string) => {
    setFormData((prev) => {
      const newRequests = [...prev.requests];
      newRequests[index] = {
        ...newRequests[index],
        requested_role: selectedRole,
      };
      return { ...prev, requests: newRequests };
    });
  };

  const handleAddRequest = () => {
    if (catalog.length === 0) return;
    setFormData((prev) => ({
      ...prev,
      requests: [
        ...prev.requests,
        {
          requested_use_case: catalog[0].name,
          requested_role: catalog[0].roles[0] || "view",
        },
      ],
    }));
  };

  const handleRemoveRequest = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requests: prev.requests.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch(`${baseUrl}/access-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      setSubmitStatus("success");
    } catch (error: any) {
      setSubmitStatus("error");
      setErrorMessage(
        error.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Surface className="max-w-md p-8 text-center animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
          <h2 className="mb-2 text-2xl font-bold text-slate-900">
            Request Submitted
          </h2>
          <p className="text-slate-600">
            Application submitted and pending review. A confirmation email will
            be sent.
          </p>
          <Button
            onClick={() => (window.location.href = "/")}
            className="mt-6 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
          >
            Return to Home
          </Button>
        </Surface>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Surface className="w-full max-w-2xl p-8 shadow-xl">
        <SectionHeading
          title="Request Access"
          description="Submit your details to request access to PathoCore private environments."
        />

        {submitStatus === "error" && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="first_name"
                className="text-sm font-medium text-slate-700"
              >
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                id="first_name"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={formData.first_name}
                onChange={handleTextChange}
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="last_name"
                className="text-sm font-medium text-slate-700"
              >
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                id="last_name"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={formData.last_name}
                onChange={handleTextChange}
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="username"
                className="text-sm font-medium text-slate-700"
              >
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={formData.username}
                onChange={handleTextChange}
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={formData.email}
                onChange={handleTextChange}
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                Use cases & Roles
              </label>
              <Button
                type="button"
                onClick={handleAddRequest}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 rounded-xl"
              >
                <Plus className="h-4 w-4" /> Add use case
              </Button>
            </div>

            {formData.requests.map((req, index) => {
              const currentCatalogItem = catalog.find(
                (c) => c.name === req.requested_use_case
              );

              return (
                <div
                  key={index}
                  className="flex items-end gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                >
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-medium text-slate-600">
                      Use case
                    </label>
                    <select
                      required
                      disabled={isLoadingCatalog}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50"
                      value={req.requested_use_case}
                      onChange={(e) =>
                        handleUseCaseChange(index, e.target.value)
                      }
                    >
                      {isLoadingCatalog ? (
                        <option value="">Loading...</option>
                      ) : (
                        catalog.map((item) => (
                          <option key={item.name} value={item.name}>
                            {item.label}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-medium text-slate-600">
                      Requested Role
                    </label>
                    <select
                      required
                      disabled={isLoadingCatalog || !currentCatalogItem}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50"
                      value={req.requested_role}
                      onChange={(e) => handleRoleChange(index, e.target.value)}
                    >
                      {currentCatalogItem?.roles.map((role) => (
                        <option key={role} value={role}>
                          {role.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.requests.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-red-500 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleRemoveRequest(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label
              htmlFor="message"
              className="text-sm font-medium text-slate-700"
            >
              Justification / Message
            </label>
            <textarea
              name="message"
              id="message"
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={formData.message}
              onChange={handleTextChange}
              placeholder="Briefly explain why you need access..."
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || isLoadingCatalog}
              className="w-full rounded-xl bg-slate-900 py-6 text-base font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting Request...
                </span>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </form>
      </Surface>
    </div>
  );
}
