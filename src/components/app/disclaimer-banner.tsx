const WORKBENCH = "https://www.sew-eurodrive.com/software-and-engineering/engineering-software/movisuite-and-workbench";
const CM3 = "https://www.sew-eurodrive.com/products/motors/servomotors";

export function DisclaimerBanner() {
  return (
    <aside
      className="border-b border-warn/30 bg-warn/10 text-sm text-foreground"
      role="note"
    >
      <div className="mx-auto max-w-[1400px] px-4 py-2.5 sm:px-6">
        <p>
          <span className="font-medium">Unofficial sizing aid.</span> Axion is not affiliated
          with SEW-EURODRIVE. Type codes and ratings here are a representative calculation
          set — not a complete or licensed catalog. Confirm every selection in{" "}
          <a
            href={WORKBENCH}
            className="underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            SEW Workbench
          </a>{" "}
          and the{" "}
          <a href={CM3} className="underline underline-offset-2" target="_blank" rel="noreferrer">
            official product catalogs
          </a>{" "}
          before you order.
        </p>
      </div>
    </aside>
  );
}
