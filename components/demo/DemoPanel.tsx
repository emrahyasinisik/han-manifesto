"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import {
  DEMO_STORES,
  averageScore,
  countBySeverity,
  getDemoProducts,
  type DemoProduct,
  type Issue,
  type Severity,
} from "@/lib/demo-data";
import type { Locale } from "@/lib/i18n";

type Step = "dashboard" | "products" | "queue";
type Decision = "pending" | "approved" | "rejected";
type DemoCopy = Dictionary["demo"];

type Props = {
  locale: Locale;
  copy: DemoCopy;
};

function severityClass(severity: Severity): string {
  if (severity === "critical") return "demo-pill demo-pill--critical";
  if (severity === "medium") return "demo-pill demo-pill--medium";
  return "demo-pill demo-pill--low";
}

function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(values[key] ?? ""),
  );
}

export function DemoPanel({ locale, copy }: Props) {
  const [step, setStep] = useState<Step>("dashboard");
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [modalProductId, setModalProductId] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [queueProgress, setQueueProgress] = useState(0);
  const [queueRunning, setQueueRunning] = useState(false);

  const products = useMemo(() => getDemoProducts(locale), [locale]);
  const numberLocale = locale === "tr" ? "tr-TR" : "en-US";

  const steps: { id: Step; label: string }[] = [
    { id: "dashboard", label: copy.steps.dashboard },
    { id: "products", label: copy.steps.products },
    { id: "queue", label: copy.steps.queue },
  ];

  const modalProduct = useMemo(
    () => products.find((p) => p.id === modalProductId) ?? null,
    [modalProductId, products],
  );

  const avg = averageScore(products);
  const severity = countBySeverity(products);
  const totalProducts = DEMO_STORES.reduce((n, s) => n + s.products, 0);

  const approvedIssues = useMemo(() => {
    const rows: { product: DemoProduct; issue: Issue }[] = [];
    for (const product of products) {
      for (const issue of product.issues) {
        if (decisions[issue.id] === "approved") {
          rows.push({ product, issue });
        }
      }
    }
    return rows;
  }, [decisions, products]);

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

  function kindLabel(kind: Issue["kind"]): string {
    return copy.kind[kind];
  }

  return (
    <div className="demo-shell grid-ledger min-h-screen">
      <div className="paper-vignette pointer-events-none absolute inset-0" />

      <div className="demo-frame relative z-10 mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
        <header className="demo-topbar">
          <div>
            <p className="demo-eyebrow">{copy.eyebrow}</p>
            <h1 className="font-serif demo-title">{copy.title}</h1>
            <p className="demo-lede">{copy.lede}</p>
          </div>
          <Link href={`/${locale}`} className="demo-link">
            {copy.backToManifesto}
          </Link>
        </header>

        <nav className="demo-steps" aria-label={copy.stepsAria}>
          {steps.map((item, index) => {
            const active = step === item.id;
            const done =
              steps.findIndex((s) => s.id === step) >
              steps.findIndex((s) => s.id === item.id);
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
                <p className="demo-metric__label">{copy.metrics.products}</p>
                <p className="demo-metric__value font-serif">
                  {totalProducts.toLocaleString(numberLocale)}
                </p>
              </article>
              <article className="demo-metric">
                <p className="demo-metric__label">{copy.metrics.avgScore}</p>
                <p className="demo-metric__value font-serif">{avg}</p>
              </article>
              <article className="demo-metric">
                <p className="demo-metric__label">{copy.metrics.critical}</p>
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
                      {copy.status[store.status]}
                    </span>
                    <span>
                      {store.products.toLocaleString(numberLocale)} {copy.skus}
                    </span>
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
                  ? copy.analyzing
                  : scanned
                    ? copy.analyzeAgain
                    : copy.analyze}
              </button>
              {scanned && (
                <button
                  type="button"
                  className="demo-btn"
                  onClick={() => setStep("products")}
                >
                  {copy.viewResults}
                </button>
              )}
            </div>
            {scanning && (
              <p className="demo-hint" role="status">
                {copy.scanningHint}
              </p>
            )}
          </section>
        )}

        {step === "products" && (
          <section className="demo-panel">
            <div className="demo-panel__head">
              <h2 className="font-serif">{copy.resultsTitle}</h2>
              <p>{copy.resultsLede}</p>
            </div>
            <ul className="demo-product-list">
              {[...products]
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
                            {product.platform} · {product.imageCount}{" "}
                            {copy.photos} · {product.issues.length}{" "}
                            {copy.suggestions}
                            {photoIssues > 0
                              ? ` · ${photoIssues} ${copy.photoIssue}`
                              : ""}
                          </p>
                        </div>
                        <div className="demo-product__right">
                          <span className="demo-score font-serif">
                            {product.ucpScore}
                          </span>
                          {critical > 0 && (
                            <span className={severityClass("critical")}>
                              {critical} {copy.criticalCount}
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
                {copy.reviewQueue} ({approvedIssues.length})
              </button>
            </div>
          </section>
        )}

        {step === "queue" && (
          <section className="demo-panel">
            <div className="demo-panel__head">
              <h2 className="font-serif">{copy.queueTitle}</h2>
              <p>{copy.queueLede}</p>
            </div>

            {approvedIssues.length === 0 ? (
              <p className="demo-hint">{copy.queueEmpty}</p>
            ) : (
              <>
                <ul className="demo-queue-list">
                  {approvedIssues.map(({ product, issue }) => (
                    <li key={issue.id} className="demo-queue-item">
                      <span className="font-serif">{product.title}</span>
                      <span>
                        {kindLabel(issue.kind)} · {copy.severity[issue.severity]}
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
                    ? `${copy.applying} ${queueProgress}%`
                    : queueProgress >= 100
                      ? copy.queueDone
                      : copy.queueReady}
                </p>

                <div className="demo-actions">
                  <button
                    type="button"
                    className="demo-btn demo-btn--primary"
                    disabled={queueRunning || queueProgress >= 100}
                    onClick={() => setQueueRunning(true)}
                  >
                    {queueProgress >= 100 ? copy.applied : copy.apply}
                  </button>
                  <button
                    type="button"
                    className="demo-btn"
                    onClick={() => setStep("products")}
                  >
                    {copy.backToProducts}
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
                <p className="demo-eyebrow">{copy.modalEyebrow}</p>
                <h2 id="demo-modal-title" className="font-serif demo-modal__title">
                  {modalProduct.title}
                </h2>
                <p className="demo-modal__meta">
                  {fill(copy.scoreMeta, {
                    score: modalProduct.ucpScore,
                    platform: modalProduct.platform,
                    photos: modalProduct.imageCount,
                  })}
                </p>
              </div>
              <button
                type="button"
                className="demo-btn"
                onClick={() => setModalProductId(null)}
              >
                {copy.close}
              </button>
            </header>

            <div className="demo-modal__body">
              {modalProduct.issues.map((issue) => {
                const decision = decisions[issue.id] ?? "pending";
                return (
                  <article key={issue.id} className="demo-issue demo-issue--modal">
                    <div className="demo-issue__top">
                      <span className={severityClass(issue.severity)}>
                        {copy.severity[issue.severity]}
                      </span>
                      <span className="demo-issue__field">
                        {kindLabel(issue.kind)}
                      </span>
                      <span className="demo-issue__status">
                        {decision === "pending"
                          ? copy.needsApproval
                          : decision === "approved"
                            ? copy.approved
                            : copy.rejected}
                      </span>
                    </div>
                    <p className="demo-issue__problem">{issue.problem}</p>
                    <p className="demo-issue__suggestion">{issue.suggestion}</p>

                    <div className="demo-compare">
                      <div className="demo-compare__col">
                        <p className="demo-diff__label">{copy.before}</p>
                        {issue.kind === "image" ? (
                          <div className="demo-photo demo-photo--before">
                            <span>{issue.beforeVisual ?? copy.before}</span>
                            <small>{issue.before}</small>
                          </div>
                        ) : (
                          <p className="demo-diff__body">{issue.before}</p>
                        )}
                      </div>
                      <div className="demo-compare__col">
                        <p className="demo-diff__label">{copy.after}</p>
                        {issue.kind === "image" ? (
                          <div className="demo-photo demo-photo--after">
                            <span>{issue.afterVisual ?? copy.after}</span>
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
                        {copy.approveFix}
                      </button>
                      <button
                        type="button"
                        className={`demo-btn ${decision === "rejected" ? "is-muted-active" : ""}`}
                        onClick={() => setDecision(issue.id, "rejected")}
                      >
                        {copy.reject}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <footer className="demo-modal__footer">
              <p className="demo-hint">{copy.modalFooter}</p>
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
                {copy.goToQueue}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
