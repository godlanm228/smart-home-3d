import { Activity, Camera, Droplets, ShieldCheck, Thermometer, Zap } from 'lucide-react'
import { usePresentationStore } from '../store/usePresentationStore'

export function MetricsDock() {
  const metrics = usePresentationStore((state) => state.metrics)

  const items = [
    { icon: Activity, label: 'Geraete', value: `${metrics.devicesActive} aktiv` },
    { icon: Camera, label: 'Kameras', value: `${metrics.camerasActive} aktiv` },
    { icon: Thermometer, label: 'Temperatur', value: `${metrics.tempC.toFixed(1)} C` },
    { icon: Droplets, label: 'Feuchtigkeit', value: `${metrics.humidity}%` },
    { icon: Zap, label: 'Energie', value: `${metrics.energyKw.toFixed(1)} kW` },
    { icon: ShieldCheck, label: 'Sicherheit', value: `${metrics.securityScore}% OK` },
  ]

  return (
    <section aria-label="Projektmetriken" className="metricsDock glass">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div className="metricItem" key={item.label}>
            <span className="metricIcon">
              <Icon size={18} />
            </span>
            <span className="metricText">
              <span className="metricLabel">{item.label}</span>
              <span className="metricValue">{item.value}</span>
            </span>
          </div>
        )
      })}
    </section>
  )
}
