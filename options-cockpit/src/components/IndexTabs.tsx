import type { Underlying } from "../models/Underlying";

type IndexTabsProps = {
  active: Underlying;
  onChange: (next: Underlying) => void;
};

function IndexTabs({ active, onChange }: IndexTabsProps) {

  const tabs: Underlying[] = ["NIFTY", "SENSEX"];

  return (
    <div className="index-tabs">
      {tabs.map(tab => (
        <button
          key={tab}
          type="button"
          className={
            tab === active
              ? "index-tab active"
              : "index-tab"
          }
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default IndexTabs;
