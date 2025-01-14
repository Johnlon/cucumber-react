import { GherkinDocument } from '@cucumber/messages'
import React from 'react'

import countScenariosByStatuses from '../../countScenariosByStatuses'
import filterByStatus from '../../filter/filterByStatus'
import { useQueries, useSearch } from '../../hooks'
import Search from '../../search/Search'
import { ExecutionSummary } from './ExecutionSummary'
import styles from './FilteredResults.module.scss'
import { GherkinDocumentList } from './GherkinDocumentList'
import { NoMatchResult } from './NoMatchResult'
import { SearchBar } from './SearchBar'
import statuses from './statuses'
import { StatusesSummary } from './StatusesSummary'

interface IProps {
  className?: string
}

export const FilteredResults: React.FunctionComponent<IProps> = ({ className }) => {
  const { cucumberQuery, gherkinQuery, envelopesQuery } = useQueries()
  const { query, hideStatuses, update } = useSearch()
  const allDocuments = gherkinQuery.getGherkinDocuments()

  const { scenarioCountByStatus, statusesWithScenarios, totalScenarioCount } =
    countScenariosByStatuses(gherkinQuery, cucumberQuery)

  const search = new Search(gherkinQuery)
  for (const gherkinDocument of allDocuments) {
    search.add(gherkinDocument)
  }

  const onlyShowStatuses = statuses.filter((s) => !hideStatuses.includes(s))

  const matches = query ? search.search(query) : allDocuments
  const filtered = matches
    .map((document) => filterByStatus(document, gherkinQuery, cucumberQuery, onlyShowStatuses))
    .filter((document) => document !== null) as GherkinDocument[]

  return (
    <div className={className}>
      <div className={styles.reportHeader}>
        <StatusesSummary
          scenarioCountByStatus={scenarioCountByStatus}
          totalScenarioCount={totalScenarioCount}
        />
        <ExecutionSummary
          scenarioCountByStatus={scenarioCountByStatus}
          totalScenarioCount={totalScenarioCount}
          testRunStarted={envelopesQuery.getTestRunStarted()}
          testRunFinished={envelopesQuery.getTestRunFinished()}
          meta={envelopesQuery.getMeta()}
        />
        <SearchBar
          query={query}
          onSearch={(query) => update({ query })}
          statusesWithScenarios={statusesWithScenarios}
          hideStatuses={hideStatuses}
          onFilter={(hideStatuses) => update({ hideStatuses })}
        />
      </div>

      {filtered.length > 0 && <GherkinDocumentList gherkinDocuments={filtered} preExpand={true} />}
      {filtered.length < 1 && <NoMatchResult query={query} />}
    </div>
  )
}
