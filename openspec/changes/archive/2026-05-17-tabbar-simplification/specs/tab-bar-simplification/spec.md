## ADDED Requirements

### Requirement: TabBar SHALL display exactly 2 navigation items
The bottom TabBar SHALL display exactly 2 tabs: Home (首頁) and Settings (設定).

#### Scenario: TabBar displays Home and Settings tabs
- **WHEN** the TabBar is rendered
- **THEN** it SHALL show exactly 2 tabs: "首頁" with a Home icon and "設定" with a Settings icon

#### Scenario: Calculator tabs are not present in TabBar
- **WHEN** the TabBar is rendered
- **THEN** it SHALL NOT show the "港美定存" or "馬拉松" tabs

### Requirement: TabBar active tab logic SHALL match exactly 2 routes
The TabBar SHALL mark the "首頁" tab as active only when `location.pathname === '/'`, and the "設定" tab as active when `location.pathname === '/settings'`.

#### Scenario: Home tab is active on root path
- **WHEN** `location.pathname` is `"/"`
- **THEN** the "首頁" tab SHALL be in active state

#### Scenario: Settings tab is active on settings path
- **WHEN** `location.pathname` is `"/settings"`
- **THEN** the "設定" tab SHALL be in active state

#### Scenario: Neither tab is active on calculator pages
- **WHEN** `location.pathname` is `"/fx-deposit-compare"` or `"/marathon-savings"`
- **THEN** neither the "首頁" nor "設定" tab SHALL be in active state
