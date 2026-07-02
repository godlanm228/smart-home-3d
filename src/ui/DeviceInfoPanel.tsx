import {
  Lamp,
  MonitorSpeaker,
  Server,
  Shield,
  Sprout,
  Thermometer,
  X,
  Zap,
} from 'lucide-react'
import { selectSelectedDevice, usePresentationStore } from '../store/usePresentationStore'
import type { DeviceInfo } from '../types'

const CATEGORY_META: Record<DeviceInfo['category'], { label: string; Icon: typeof Shield }> = {
  security: { label: 'Sicherheit', Icon: Shield },
  energy: { label: 'Energie', Icon: Zap },
  comfort: { label: 'Komfort', Icon: Lamp },
  climate: { label: 'Klima', Icon: Thermometer },
  media: { label: 'Multimedia', Icon: MonitorSpeaker },
  infrastructure: { label: 'Infrastruktur', Icon: Server },
  garden: { label: 'Garten', Icon: Sprout },
}

const STATUS_META: Record<DeviceInfo['status'], { label: string; tone: string }> = {
  online: { label: 'Online', tone: 'green' },
  included: { label: 'Inklusive', tone: 'blue' },
  planned: { label: 'Geplant', tone: 'gold' },
  offline: { label: 'Offline', tone: 'red' },
}

const LEVEL_DE: Record<NonNullable<DeviceInfo['packageLevel']>, string> = {
  basic: 'Basic',
  standard: 'Standard',
  premium: 'Premium',
  module: 'Modul',
}

/** Right context card (§0 mockup): detailed info for the selected device. */
export function DeviceInfoPanel() {
  const device = usePresentationStore(selectSelectedDevice)
  const selectedDeviceId = usePresentationStore((state) => state.selectedDeviceId)
  const selectDevice = usePresentationStore((state) => state.selectDevice)

  if (!device) return null
  const { label: catLabel, Icon } = CATEGORY_META[device.category]
  const status = STATUS_META[device.status]

  return (
    <aside className="devicePanel glass">
      <div className="deviceHeader">
        <h2 className="deviceTitle">{device.label}</h2>
        <div className="deviceHeaderRight">
          <span className={`status tone-${status.tone}`}>{status.label}</span>
          {selectedDeviceId ? (
            <button aria-label="Schließen" className="panelClose" onClick={() => selectDevice(null)} type="button">
              <X size={14} />
            </button>
          ) : null}
        </div>
      </div>
      <div className="devicePreview" aria-hidden="true">
        <Icon size={44} strokeWidth={1.4} />
        <span className="deviceCategory">{catLabel}</span>
      </div>
      <p className="deviceDescription">{device.description}</p>
      <ul className="featureList">
        {device.features.slice(0, 5).map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <p className="deviceBenefit">{device.benefit}</p>
      <div className="deviceFooter">
        {device.packageLevel ? <span className="chip chipSmall">{LEVEL_DE[device.packageLevel]}</span> : null}
        {device.cost ? <span className="chip chipSmall">{device.cost.toLocaleString('de-DE')} €</span> : null}
      </div>
    </aside>
  )
}
