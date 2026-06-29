import { Camera, CircleCheck } from 'lucide-react'
import { selectSelectedDevice, usePresentationStore } from '../store/usePresentationStore'

export function DeviceInfoPanel() {
  const device = usePresentationStore(selectSelectedDevice)

  if (!device) return null

  return (
    <aside className="devicePanel glass">
      <div className="deviceHeader">
        <h2 className="deviceTitle">{device.label}</h2>
        <span className="status">{device.status}</span>
      </div>
      <div className="devicePreview" aria-hidden="true">
        <Camera size={58} strokeWidth={1.45} />
      </div>
      <ul className="featureList">
        {device.features.slice(0, 5).map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <div className="panelActions">
        <button className="primaryAction" type="button">
          Live View
        </button>
        <button className="secondaryAction" type="button">
          <CircleCheck size={14} /> Status
        </button>
      </div>
    </aside>
  )
}
