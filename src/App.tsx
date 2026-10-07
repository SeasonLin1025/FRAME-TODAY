import { useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { WeatherId } from './data/types'
import { getIssue } from './data/issues'
import { HOME_AMBIENT, WEATHER_AMBIENT, WEATHER_PAGE_AMBIENT, ambientFromIssue, type Ambient } from './lib/theme'
import { EASE } from './lib/utils'
import AmbientBackdrop from './components/AmbientBackdrop'
import { ToastProvider } from './components/Toast'
import HomePage from './components/HomePage'
import WeatherPage from './components/WeatherPage'
import IssueSelectPage from './components/IssueSelectPage'
import IssuePage from './components/IssuePage'
import DownloadModal from './components/DownloadModal'

/** home → weather → issues → issue 四段独立页面流 */
type Stage = 'home' | 'weather' | 'issues' | 'issue'

function Page({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.36, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const [stage, setStage] = useState<Stage>('home')
  const [weather, setWeather] = useState<WeatherId | null>(null)
  const [issueId, setIssueId] = useState<string | null>(null)
  const [showDownload, setShowDownload] = useState(false)

  const issue = getIssue(issueId)

  const ambient: Ambient = useMemo(() => {
    if (stage === 'issue' && issue) return ambientFromIssue(issue)
    if (stage === 'issues' && weather) return WEATHER_AMBIENT[weather]
    if (stage === 'weather') return WEATHER_PAGE_AMBIENT
    return HOME_AMBIENT
  }, [stage, weather, issue])

  const toStage = (s: Stage) => {
    setStage(s)
    window.scrollTo({ top: 0 })
  }

  const openIssue = (id: string) => {
    setIssueId(id)
    toStage('issue')
  }

  return (
    <ToastProvider>
      <AmbientBackdrop ambient={ambient} />

      <div className="relative z-10 min-h-dvh">
        <div
          className="mx-auto min-h-dvh w-full max-w-[430px] border-x"
          style={{ borderColor: ambient.hairline }}
        >
          <AnimatePresence mode="wait">
            {stage === 'home' && (
              <Page key="home">
                <HomePage onStart={() => toStage('weather')} />
              </Page>
            )}

            {stage === 'weather' && (
              <Page key="weather">
                <WeatherPage
                  onWeather={(w) => {
                    setWeather(w)
                    toStage('issues')
                  }}
                  onBack={() => toStage('home')}
                />
              </Page>
            )}

            {stage === 'issues' && weather && (
              <Page key={`issues-${weather}`}>
                <IssueSelectPage
                  weather={weather}
                  onIssue={openIssue}
                  onBack={() => toStage('weather')}
                />
              </Page>
            )}

            {stage === 'issue' && issue && (
              <Page key={`issue-${issue.id}`}>
                <IssuePage
                  issue={issue}
                  onChange={() => toStage('issues')}
                  onDownload={() => setShowDownload(true)}
                />
              </Page>
            )}
          </AnimatePresence>
        </div>
      </div>

      {issue && (
        <DownloadModal
          issue={issue}
          open={showDownload}
          onClose={() => setShowDownload(false)}
        />
      )}
    </ToastProvider>
  )
}
