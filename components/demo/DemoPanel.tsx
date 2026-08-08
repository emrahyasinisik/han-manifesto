"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DEMO_PRODUCTS,
  DEMO_STORES,
  averageScore,
  countBySeverity,
  type DemoProduct,
  type Issue,
  type Severity,
} from "@/lib/demo-data";

type Step = "dashboard" | "products" | "queue";
type Decision = "pending" | "approved" | "rejected";

const STEPS: { id: Step; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "products", label: "Products" },
  { id: "queue", label: "Apply" },
];

function severityClass(severity: Severity): string {
  if (severity === "critical") return "demo-pill demo-pill--critical";
  if (severity === "medium") return "demo-pill demo-pill--medium";
  return "demo-pill demo-pill--low";
}

function kindLabel(kind: Issue["kind"]): string {
  if (kind === "title") return "Name";
  if (kind === "description") return "Description";
  if (kind === "image") return "Photos";
  return "Attributes";
}

export function DemoPanel() {
  const [step, setStep] = useState<Step>("dashboard");
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [modalProductId, setModalProductId] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [queueProgress, setQueueProgress] = useState(0);
  const [queueRunning, setQueueRunning] = useState(false);

  const modalProduct = useMemo(
    () => DEMO_PRODUCTS.find((p) => p.id === modalProductId) ?? null,
    [modalProductId],
  );

  const avg = averageScore(DEMO_PRODUCTS);
  const severity = countBySeverity(DEMO_PRODUCTS);
  const totalProducts = DEMO_STORES.reduce((n, s) => n + s.products, 0);

  const approvedIssues = useMemo(() => {
    const rows: { product: DemoProduct; issue: Issue }[] = [];
    for (const product of DEMO_PRODUCTS) {
      for (const issue of product.issues) {
        if (decisions[issue.id] === "approved") {
          rows.push({ product, issue });
        }
      }
    }
    return rows;
  }, [decisions]);

  useEffect(() => {
    if (!scanning) return;
    const timer = window.setTimeout(() => {
      setScanning(false);
      setScanned(true);
      setStep("products");
    }, 1700);
    return () => window.clearTimeout(timer);
  }, [scanning]);

  useEffect(() => {
    if (!queueRunning) return;
    setQueueProgress(0);
    let tick = 0;
    const id = window.setInterval(() => {
      tick += 1;
      const next = Math.min(100, tick * 12);
      setQueueProgress(next);
      if (next >= 100) {
        window.clearInterval(id);
        setQueueRunning(false);
      }
    }, 280);
    return () => window.clearInterval(id);
  }, [queueRunning]);

  useEffect(() => {
    if (!modalProductId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModalProductId(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [modalProductId]);

  function setDecision(issueId: string, value: Decision) {
    setDecisions((prev) => ({ ...prev, [issueId]: value }));
  }

  function openProduct(id: string) {
    setModalProductId(id);
  }

  return (
    <div className="demo-shell grid-ledger min-h-screen">
      <div className="paper-vignette pointer-events-none absolute inset-0" />

      <div className="demo-frame relative z-10 mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
        <header className="demo-topbar">
          <div>
            <p className="demo-eyebrow">HAN · Panel demo</p>
            <h1 className="font-serif demo-title">Product analysis mock</h1>
            <p className="demo-lede">
              Analyzes name, description, and photos — then proposes fixes.
              Each suggestion opens before/after side-by-side and needs its own
              approval.
            </p>
          </div>
          <Link href="/" className="demo-link">
            ← Manifesto
          </Link>
        </header>

        <nav className="demo-steps" aria-label="Demo steps">
          {STEPS.map((item, index) => {
            const active = step === item.id;
            const done =
              STEPS.findIndex((s) => s.id === step) >
              STEPS.findIndex((s) => s.id === item.id);
            return (
              <button
                key={item.id}
                type="button"
                className={`demo-step ${active ? "is-active" : ""} ${done ? "is-done" : ""}`}
                onClick={() => setStep(item.id)}
              >
                <span className="demo-step__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {step === "dashboard" && (
          <section className="demo-panel">
            <div className="demo-metrics">
              <article className="demo-metric">
                <p className="demo-metric__label">Products</p>
                <p className="demo-metric__value font-serif">
                  {totalProducts.toLocaleString("en-US")}
                </p>
              </article>
              <article className="demo-metric">
                <p className="demo-metric__label">Avg UCP score</p>
                <p className="demo-metric__value font-serif">{avg}</p>
              </article>
              <article className="demo-metric">
                <p className="demo-metric__label">Critical issues</p>
                <p className="demo-metric__value font-serif">
                  {severity.critical}
                </p>
              </article>
            </div>

            <div className="demo-stores">
              {DEMO_STORES.map((store) => (
                <article key={store.id} className="demo-store">
                  <div>
                    <p className="demo-store__platform">{store.platform}</p>
                    <p className="demo-store__name">{store.name}</p>
                  </div>
                  <div className="demo-store__meta">
                    <span className={`demo-status demo-status--${store.status}`}>
                      {store.status}
                    </span>
                    <span>{store.products.toLocaleString("en-US")} SKUs</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="demo-actions">
              <button
                type="button"
                className="demo-btn demo-btn--primary"
                disabled={scanning}
                onClick={() => setScanning(true)}
              >
                {scanning
                  ? "Analyzing photos, names & copy…"
                  : scanned
                    ? "Run analysis again"
                    : "Analyze products"}
              </button>
              {scanned && (
                <button
                  type="button"
                  className="demo-btn"
                  onClick={() => setStep("products")}
                >
                  View results
                </button>
              )}
            </div>
            {scanning && (
              <p className="demo-hint" role="status">
                Checking images, titles, and descriptions against UCP / SEO
                rules…
              </p>
            )}
          </section>
        )}

        {step === "products" && (
          <section className="demo-panel">
            <div className="demo-panel__head">
              <h2 className="font-serif">Analysis results</h2>
              <p>
                Open a product to review each suggestion in a popup — approve or
                reject one by one.
              </p>
            </div>
            <ul className="demo-product-list">
              {[...DEMO_PRODUCTS]
                .sort((a, b) => a.ucpScore - b.ucpScore)
                .map((product) => {
                  const critical = product.issues.filter(
                    (i) => i.severity === "critical",
                  ).length;
                  const photoIssues = product.issues.filter(
                    (i) => i.kind === "image",
                  ).length;
                  return (
                    <li key={product.id}>
                      <button
                        type="button"
                        className="demo-product"
                        onClick={() => openProduct(product.id)}
                      >
                        <div>
                          <p className="demo-product__title">{product.title}</p>
                          <p className="demo-product__meta">
                            {product.platform} · {product.imageCount} photos ·{" "}
                            {product.issues.length} suggestions
                            {photoIssues > 0
                              ? ` · ${photoIssues} photo`
                              : ""}
                          </p>
                        </div>
                        <div className="demo-product__right">
                          <span className="demo-score font-serif">
                            {product.ucpScore}
                          </span>
                          {critical > 0 && (
                            <span className={severityClass("critical")}>
                              {critical} critical
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
            </ul>
            <div className="demo-actions" style={{ marginTop: "1.25rem" }}>
              <button
                type="button"
                className="demo-btn demo-btn--primary"
                disabled={approvedIssues.length === 0}
                onClick={() => setStep("queue")}
              >
                Review apply queue ({approvedIssues.length})
              </button>
            </div>
          </section>
        )}

        {step === "queue" && (
          <section className="demo-panel">
            <div className="demo-panel__head">
              <h2 className="font-serif">Chunked apply</h2>
              <p>
                Only individually approved suggestions enter the queue — then
                apply in small rate-limited batches.
              </p>
            </div>

            {approvedIssues.length === 0 ? (
              <p className="demo-hint">
                Nothing approved yet. Open a product popup and approve suggestions
                one by one.
              </p>
            ) : (
              <>
                <ul className="demo-queue-list">
                  {approvedIssues.map(({ product, issue }) => (
                    <li key={issue.id} className="demo-queue-item">
                      <span className="font-serif">{product.title}</span>
                      <span>
                        {kindLabel(issue.kind)} · {issue.severity}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="demo-progress">
                  <div
                    className="demo-progress__bar"
                    style={{ width: `${queueProgress}%` }}
                  />
                </div>
                <p className="demo-hint" role="status">
                  {queueRunning
                    ? `Applying batch… ${queueProgress}%`
                    : queueProgress >= 100
                      ? "Demo complete — each write logged; rollback snapshot kept."
                      : "Ready to simulate apply."}
                </p>

                <div className="demo-actions">
                  <button
                    type="button"
                    className="demo-btn demo-btn--primary"
                    disabled={queueRunning || queueProgress >= 100}
                    onClick={() => setQueueRunning(true)}
                  >
                    {queueProgress >= 100 ? "Applied" : "Apply gradually"}
                  </button>
                  <button
                    type="button"
                    className="demo-btn"
                    onClick={() => setStep("products")}
                  >
                    Back to products
                  </button>
                </div>
              </>
            )}
          </section>
        )}
      </div>

      {modalProduct && (
        <div
          className="demo-modal-root"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setModalProductId(null);
          }}
        >
          <div
            className="demo-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-modal-title"
          >
            <header className="demo-modal__header">
              <div>
                <p className="demo-eyebrow">Suggestion review</p>
                <h2 id="demo-modal-title" className="font-serif demo-modal__title">
                  {modalProduct.title}
                </h2>
                <p className="demo-modal__meta">
                  Score {modalProduct.ucpScore}/100 · {modalProduct.platform} ·{" "}
                  {modalProduct.imageCount} photos analyzed
                </p>
              </div>
              <button
                type="button"
                className="demo-btn"
                onClick={() => setModalProductId(null)}
              >
                Close
              </button>
            </header>

            <div className="demo-modal__body">
              {modalProduct.issues.map((issue) => {
                const decision = decisions[issue.id] ?? "pending";
                return (
                  <article key={issue.id} className="demo-issue demo-issue--modal">
                    <div className="demo-issue__top">
                      <span className={severityClass(issue.severity)}>
                        {issue.severity}
                      </span>
                      <span className="demo-issue__field">
                        {kindLabel(issue.kind)}
                      </span>
                      <span className="demo-issue__status">
                        {decision === "pending"
                          ? "Needs approval"
                          : decision === "approved"
                            ? "Approved"
                            : "Rejected"}
                      </span>
                    </div>
                    <p className="demo-issue__problem">{issue.problem}</p>
                    <p className="demo-issue__suggestion">{issue.suggestion}</p>

                    <div className="demo-compare">
                      <div className="demo-compare__col">
                        <p className="demo-diff__label">Before</p>
                        {issue.kind === "image" ? (
                          <div className="demo-photo demo-photo--before">
                            <span>{issue.beforeVisual ?? "Before"}</span>
                            <small>{issue.before}</small>
                          </div>
                        ) : (
                          <p className="demo-diff__body">{issue.before}</p>
                        )}
                      </div>
                      <div className="demo-compare__col">
                        <p className="demo-diff__label">After</p>
                        {issue.kind === "image" ? (
                          <div className="demo-photo demo-photo--after">
                            <span>{issue.afterVisual ?? "After"}</span>
                            <small>{issue.after}</small>
                          </div>
                        ) : (
                          <p className="demo-diff__body demo-diff__body--proposed">
                            {issue.after}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="demo-actions">
                      <button
                        type="button"
                        className={`demo-btn ${decision === "approved" ? "demo-btn--primary" : ""}`}
                        onClick={() => setDecision(issue.id, "approved")}
                      >
                        Approve this fix
                      </button>
                      <button
                        type="button"
                        className={`demo-btn ${decision === "rejected" ? "is-muted-active" : ""}`}
                        onClick={() => setDecision(issue.id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <footer className="demo-modal__footer">
              <p className="demo-hint">
                Approvals are per suggestion — nothing writes back until you send
                the queue.
              </p>
              <button
                type="button"
                className="demo-btn demo-btn--primary"
                disabled={
                  !modalProduct.issues.some(
                    (issue) => decisions[issue.id] === "approved",
                  )
                }
                onClick={() => {
                  setModalProductId(null);
                  setStep("queue");
                }}
              >
                Go to apply queue
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
