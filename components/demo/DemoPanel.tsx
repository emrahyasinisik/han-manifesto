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

type Step = "dashboard" | "products" | "report" | "queue";

type Decision = "pending" | "approved" | "rejected";

const STEPS: { id: Step; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "products", label: "Products" },
  { id: "report", label: "Report" },
  { id: "queue", label: "Apply" },
];

function severityClass(severity: Severity): string {
  if (severity === "critical") return "demo-pill demo-pill--critical";
  if (severity === "medium") return "demo-pill demo-pill--medium";
  return "demo-pill demo-pill--low";
}

export function DemoPanel() {
  const [step, setStep] = useState<Step>("dashboard");
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [selectedId, setSelectedId] = useState(DEMO_PRODUCTS[0]?.id ?? "");
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [queueProgress, setQueueProgress] = useState(0);
  const [queueRunning, setQueueRunning] = useState(false);

  const selected = useMemo(
    () => DEMO_PRODUCTS.find((p) => p.id === selectedId) ?? DEMO_PRODUCTS[0],
    [selectedId],
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
    }, 1600);
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

  function setDecision(issueId: string, value: Decision) {
    setDecisions((prev) => ({ ...prev, [issueId]: value }));
  }

  return (
    <div className="demo-shell grid-ledger min-h-screen">
      <div className="paper-vignette pointer-events-none absolute inset-0" />

      <div className="demo-frame relative z-10 mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
        <header className="demo-topbar">
          <div>
            <p className="demo-eyebrow">HAN · Panel demo</p>
            <h1 className="font-serif demo-title">UCP readiness mock</h1>
            <p className="demo-lede">
              Fake data only — connect stores, scan for schema/SEO gaps, review
              AI suggestions, then apply in rate-limited chunks.
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
                  ? "Scanning catalog…"
                  : scanned
                    ? "Scan again"
                    : "Scan products"}
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
                Rule engine + classifier running on normalized UCP items…
              </p>
            )}
          </section>
        )}

        {step === "products" && (
          <section className="demo-panel">
            <div className="demo-panel__head">
              <h2 className="font-serif">Scanned products</h2>
              <p>Sorted by impact — lowest UCP score first.</p>
            </div>
            <ul className="demo-product-list">
              {[...DEMO_PRODUCTS]
                .sort((a, b) => a.ucpScore - b.ucpScore)
                .map((product) => {
                  const critical = product.issues.filter(
                    (i) => i.severity === "critical",
                  ).length;
                  const medium = product.issues.filter(
                    (i) => i.severity === "medium",
                  ).length;
                  return (
                    <li key={product.id}>
                      <button
                        type="button"
                        className={`demo-product ${selectedId === product.id ? "is-selected" : ""}`}
                        onClick={() => {
                          setSelectedId(product.id);
                          setStep("report");
                        }}
                      >
                        <div>
                          <p className="demo-product__title">{product.title}</p>
                          <p className="demo-product__meta">
                            {product.platform} · {product.issues.length} issues
                          </p>
                        </div>
                        <div className="demo-product__right">
                          <span className="demo-score font-serif">
                            {product.ucpScore}
                          </span>
                          <span className="demo-product__badges">
                            {critical > 0 && (
                              <span className={severityClass("critical")}>
                                {critical} critical
                              </span>
                            )}
                            {medium > 0 && (
                              <span className={severityClass("medium")}>
                                {medium} medium
                              </span>
                            )}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </section>
        )}

        {step === "report" && selected && (
          <section className="demo-panel">
            <div className="demo-panel__head">
              <h2 className="font-serif">{selected.title}</h2>
              <p>
                Score {selected.ucpScore}/100 · review each suggestion before
                write-back.
              </p>
            </div>

            <div className="demo-issue-list">
              {selected.issues.map((issue) => {
                const decision = decisions[issue.id] ?? "pending";
                return (
                  <article key={issue.id} className="demo-issue">
                    <div className="demo-issue__top">
                      <span className={severityClass(issue.severity)}>
                        {issue.severity}
                      </span>
                      <span className="demo-issue__field">{issue.field}</span>
                    </div>
                    <p className="demo-issue__problem">{issue.problem}</p>
                    <p className="demo-issue__suggestion">{issue.suggestion}</p>
                    <div className="demo-diff">
                      <div>
                        <p className="demo-diff__label">Current</p>
                        <p className="demo-diff__body">{issue.current}</p>
                      </div>
                      <div>
                        <p className="demo-diff__label">Proposed</p>
                        <p className="demo-diff__body demo-diff__body--proposed">
                          {issue.proposed}
                        </p>
                      </div>
                    </div>
                    <div className="demo-actions">
                      <button
                        type="button"
                        className={`demo-btn ${decision === "approved" ? "demo-btn--primary" : ""}`}
                        onClick={() => setDecision(issue.id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className={`demo-btn ${decision === "rejected" ? "is-muted-active" : ""}`}
                        onClick={() => setDecision(issue.id, "rejected")}
                      >
                        Reject
                      </button>
                      <span className="demo-hint">
                        {decision === "pending"
                          ? "Awaiting decision"
                          : decision === "approved"
                            ? "Queued for apply"
                            : "Skipped"}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="demo-actions">
              <button
                type="button"
                className="demo-btn"
                onClick={() => setStep("products")}
              >
                Back to products
              </button>
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
                Approved fixes ship in small batches with jitter — never a single
                burst write.
              </p>
            </div>

            {approvedIssues.length === 0 ? (
              <p className="demo-hint">
                No approved suggestions yet. Open a product report and approve at
                least one fix.
              </p>
            ) : (
              <>
                <ul className="demo-queue-list">
                  {approvedIssues.map(({ product, issue }) => (
                    <li key={issue.id} className="demo-queue-item">
                      <span className="font-serif">{product.title}</span>
                      <span>
                        {issue.field} · {issue.severity}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="demo-progress" aria-hidden={!queueRunning}>
                  <div
                    className="demo-progress__bar"
                    style={{ width: `${queueProgress}%` }}
                  />
                </div>
                <p className="demo-hint" role="status">
                  {queueRunning
                    ? `Applying batch… ${queueProgress}% (rate-limit aware)`
                    : queueProgress >= 100
                      ? "Demo complete — audit log written; rollback snapshot kept."
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
                    onClick={() => setStep("dashboard")}
                  >
                    Back to dashboard
                  </button>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
