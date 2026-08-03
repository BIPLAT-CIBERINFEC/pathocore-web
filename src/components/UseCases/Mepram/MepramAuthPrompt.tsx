import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surface, SectionHeading } from "@/components/mepram/MepramPrimitives";

interface CatalogItem {
  name: string;
  label: string;
  labs: string[];
  roles: string[];
}

interface BaseFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  message: string;
  requested_lab: string;
}

export function MepramAuthPrompt() {
  const [formData, setFormData] = useState<BaseFormData>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    message: "",
    requested_lab: "",
  });

  const [selectedAccesses, setSelectedAccesses] = useState<
    Record<string, string>
  >({});
  const [currentSelection, setCurrentSelection] = useState<string>("");

  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "/api/pathocore/v1";

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await fetch(`${baseUrl}/access-requests/catalog`);
        if (!response.ok) throw new Error("Error al cargar el catálogo");
        const data = await response.json();
        setCatalog(data);
      } catch (error) {
        console.error("Error al obtener catálogo:", error);
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

  const handleAddUseCase = () => {
    if (!currentSelection) return;

    const selectedItem = catalog.find((c) => c.name === currentSelection);
    if (selectedItem && !selectedAccesses[currentSelection]) {
      setSelectedAccesses((prev) => ({
        ...prev,
        [currentSelection]: selectedItem.roles[0] || "view",
      }));
    }
    setCurrentSelection("");
  };


  const handleRemoveUseCase = (useCaseName: string) => {
    const newSelections = { ...selectedAccesses };
    delete newSelections[useCaseName];
    setSelectedAccesses(newSelections);
  };


  const handleChangeRole = (useCaseName: string, role: string) => {
    setSelectedAccesses((prev) => ({
      ...prev,
      [useCaseName]: role,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("idle");
    setErrorMessage("");

    const selectedKeys = Object.keys(selectedAccesses);

    if (selectedKeys.length === 0) {
      setErrorMessage("Please select and add at least one use case.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        message: formData.message,
        requests: selectedKeys.map((useCaseName) => ({
          requested_use_case: useCaseName,
          requested_role: selectedAccesses[useCaseName],
        })),
      };

      const response = await fetch(`${baseUrl}/access-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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

  const availableOptions = catalog.filter((c) => !selectedAccesses[c.name]);

  if (submitStatus === "success") {
    return (
      <Surface className="max-w-md w-full p-8 text-center shadow-xl animate-in fade-in zoom-in duration-300">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          Request Submitted
        </h2>
        <p className="text-slate-600">
          Request received and pending review. You will receive an email once an
          administrator processes your access.
        </p>
        <Button
          onClick={() => (window.location.href = "/")}
          className="mt-6 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
        >
          Return to Home
        </Button>
      </Surface>
    );
  }

  return (
    <Surface className="w-full max-w-2xl p-8 shadow-xl">
      <SectionHeading
        title="Request Access"
        description="Submit your details to request access to PathoCore private environments."
      />

      {submitStatus === "error" && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
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
              value={formData.first_name}
              onChange={handleTextChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              value={formData.last_name}
              onChange={handleTextChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              value={formData.username}
              onChange={handleTextChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              value={formData.email}
              onChange={handleTextChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-900">
              Environments & Roles
            </label>
            {isLoadingCatalog && (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            )}
          </div>

          <div className="flex gap-2">
            <select
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50"
              value={currentSelection}
              onChange={(e) => setCurrentSelection(e.target.value)}
              disabled={isLoadingCatalog || availableOptions.length === 0}
            >
              <option value="" disabled>
                {isLoadingCatalog
                  ? "Loading environments..."
                  : availableOptions.length === 0
                  ? "No more environments available"
                  : "Select an environment to add..."}
              </option>
              {availableOptions.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.label}
                </option>
              ))}
            </select>
            <Button
              type="button"
              onClick={handleAddUseCase}
              disabled={!currentSelection}
              className="rounded-xl bg-indigo-600 px-4 text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {Object.keys(selectedAccesses).length > 0 && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">
                Selected Environments
              </h4>
              {Object.entries(selectedAccesses).map(
                ([useCaseName, selectedRole]) => {
                  const catalogItem = catalog.find(
                    (c) => c.name === useCaseName
                  );
                  if (!catalogItem) return null;

                  return (
                    <div
                      key={useCaseName}
                      className="flex items-center justify-between gap-4 rounded-lg bg-white p-3 shadow-sm border border-slate-100"
                    >
                      <span className="font-medium text-slate-800 text-sm">
                        {catalogItem.label}
                      </span>

                      <div className="flex items-center gap-3">
                        <select
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={selectedRole}
                          onChange={(e) =>
                            handleChangeRole(useCaseName, e.target.value)
                          }
                        >
                          {catalogItem.roles.map((role) => (
                            <option key={role} value={role}>
                              {role.toUpperCase()}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveUseCase(useCaseName)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="message"
            className="text-sm font-medium text-slate-700"
          >
            Justification / Message
          </label>
          <textarea
            name="message"
            id="message"
            rows={3}
            required
            className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={formData.message}
            onChange={handleTextChange}
            placeholder="Briefly explain why you need access..."
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              isLoadingCatalog ||
              Object.keys(selectedAccesses).length === 0
            }
            className="w-full rounded-xl bg-slate-900 py-6 text-base font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting Request...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </div>
      </form>
    </Surface>
  );
}
