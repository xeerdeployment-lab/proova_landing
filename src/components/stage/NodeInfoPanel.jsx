import { X } from "lucide-react";
import { useCallback, useSyncExternalStore } from "react";
import { Link } from "react-router";
import { getSelectedNode, selectNode, stage, subscribeStage } from "../../three/stageStore";

/**
 * Glass panel the stage pins beside the selected hero node. Position is written straight to
 * the element by the render loop; React only re-renders when the selection changes.
 */
export default function NodeInfoPanel() {
  const node = useSyncExternalStore(subscribeStage, getSelectedNode, () => null);
  const register = useCallback((element) => {
    stage.panelEl = element;
  }, []);

  return (
    <div ref={register} data-visible="false" data-side="right" className="node-panel pointer-events-none fixed top-0 left-0 z-30">
      <div className="node-panel-card glass w-64 rounded-2xl p-4" data-no-stage role="status" aria-live="polite">
        {node ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-[0.62rem] font-semibold tracking-[0.18em] text-mist uppercase">
                  <span className="h-2 w-2 rounded-full" style={{ background: node.color, boxShadow: `0 0 12px ${node.color}` }} />
                  {node.role}
                </p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-snow">{node.title}</p>
              </div>
              <button
                type="button"
                onClick={() => selectNode(null)}
                className="-mt-1 -mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-mist transition-colors hover:bg-white/10 hover:text-snow"
              >
                <X size={14} aria-hidden="true" />
                <span className="sr-only">Close node details</span>
              </button>
            </div>
            <dl className="mt-3 divide-y divide-white/[0.07] border-y border-white/[0.07] text-xs">
              <div className="flex justify-between py-2">
                <dt className="text-mist">Depth</dt>
                <dd className="text-snow">Level {node.level}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-mist">Connections below</dt>
                <dd className="text-snow">{node.connections}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[0.7rem] leading-relaxed text-mist">
              Illustrative structure. Not a member record and not an example of earnings.
            </p>
            <Link to="/#network" className="mt-3 inline-flex text-xs font-medium text-iris transition-colors hover:text-snow">
              See how real records are shown →
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}
