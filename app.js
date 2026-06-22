const STORAGE_KEY = "people-management-v4";
const LEGACY_KEY = "people-management-v1";
const SUPABASE_URL = "https://irhybluwgzziegbcrfjc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyaHlibHV3Z3ppaWVnYmNyZmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMDgxMTMsImV4cCI6MjA5NzY4NDExM30.GKNO2VcXNI00S5UZbEN6r7In5abwtwjsSmsRVXy-7Ng";
const SUPABASE_STATE_ID = "main";
const CONTRACT_TYPES = ["Employee", "Leased Labour", "Intern"];

const defaultState = {
  language: "zh",
  sessionAccountId: "",
  instituteName: "xxxx Research Center",
  selectedUnitId: "all",
  selectedTeamId: "all",
  selectedTalentUnitId: "all",
  selectedTalentTeamId: "all",
  selectedOverviewTeamId: "team-1",
  activePage: "overviewPage",
  peopleDisplayLimit: 24,
  peopleDisplayLimitMigrated: false,
  searchText: "",
  ownerViewScope: { type: "center", id: "center-1" },
  customOrgCleanupDone: false,
  talentTags: ["AI", "领军人物", "优秀人才", "关键岗位", "高潜人才"],
  awardNames: ["年度创新奖", "优秀人才奖", "技术突破奖"],
  talentActionTypes: ["IDP", "Succession", "Key Role Backup", "Retention Risk", "Learning"],
  cultureActivityTypes: ["团队活动", "峰会参会", "技术分享", "跨团队共创"],
  orgGoals: [],
  cultureActivities: [],
  talentActions: [],
  formerPeople: [],
  org: {
    center: {
      id: "center-1",
      name: "xxxx Research Center",
      directorAccountId: "research-director-1",
    },
    units: [
      {
        id: "lab-ai",
        type: "lab",
        name: "AI Lab",
        directorAccountId: "lab-director-ai",
        plrAccountId: "plr-ai",
        teams: [
          { id: "team-1", name: "Algorithm Platform Team", managerAccountId: "team-manager-algo" },
          { id: "team-2", name: "Data Engineering Team", managerAccountId: "team-manager-data" },
        ],
      },
      {
        id: "lab-product",
        type: "lab",
        name: "Product Lab",
        directorAccountId: "lab-director-product",
        plrAccountId: "plr-product",
        teams: [
          { id: "team-3", name: "Product Innovation Team", managerAccountId: "team-manager-product" },
          { id: "team-6", name: "Software R&D Team", managerAccountId: "team-manager-software" },
        ],
      },
      {
        id: "platform-core",
        type: "platform",
        name: "Core Platform",
        directorAccountId: "platform-lead-core",
        plrAccountId: "",
        teams: [
          { id: "team-5", name: "Hardware Systems Team", managerAccountId: "team-manager-hardware" },
          { id: "team-7", name: "Quality & Compliance Team", managerAccountId: "team-manager-quality" },
        ],
      },
      {
        id: "platform-ops",
        type: "platform",
        name: "Operations Platform",
        directorAccountId: "platform-lead-ops",
        plrAccountId: "",
        teams: [
          { id: "team-8", name: "User Research Team", managerAccountId: "team-manager-user" },
          { id: "team-9", name: "Operations Support Team", managerAccountId: "team-manager-ops" },
          { id: "team-10", name: "Strategic Projects Team", managerAccountId: "team-manager-strategy" },
        ],
      },
    ],
  },
  accounts: [
    { id: "owner-1", name: "Owner 账号 1", email: "owner1@example.com", password: "owner123", role: "owner", scopeType: "center", scopeId: "center-1" },
    { id: "owner-2", name: "Owner 账号 2", email: "owner2@example.com", password: "owner123", role: "owner", scopeType: "center", scopeId: "center-1" },
    { id: "research-director-1", name: "Elena Moreau", email: "director@example.com", password: "director123", role: "researchDirector", scopeType: "center", scopeId: "center-1" },
    { id: "lab-director-ai", name: "Matthias Keller", email: "ailab.director@example.com", password: "lab123", role: "labDirector", scopeType: "unit", scopeId: "lab-ai" },
    { id: "plr-ai", name: "Sofia Romano", email: "ai.plr@example.com", password: "plr123", role: "plr", scopeType: "unit", scopeId: "lab-ai" },
    { id: "team-manager-algo", name: "Nicolas Laurent", email: "algo.manager@example.com", password: "team123", role: "teamManager", scopeType: "team", scopeId: "team-1" },
    { id: "team-manager-data", name: "Marta Kowalska", email: "data.manager@example.com", password: "team123", role: "teamManager", scopeType: "team", scopeId: "team-2" },
    { id: "team-manager-product", name: "Pieter Janssen", email: "product.manager@example.com", password: "team123", role: "teamManager", scopeType: "team", scopeId: "team-3" },
    { id: "team-manager-software", name: "Clara Fischer", email: "software.manager@example.com", password: "team123", role: "teamManager", scopeType: "team", scopeId: "team-6" },
  ],
  people: [],
};

const translations = {
  zh: {
    loginTitle: "登录", email: "邮箱", password: "密码", login: "登录", logout: "退出登录",
    changePassword: "修改密码", currentPassword: "当前密码", newPassword: "新密码", confirmNewPassword: "确认新密码", savePassword: "保存密码", temporaryPassword: "临时密码",
    language: "语言 / Language", accountsAndPermissions: "领导关系与 HRBP 覆盖",
    accountName: "账号姓名", permissionRole: "授权角色", scope: "授权范围", addAccount: "添加账号",
    ownerCanAssign: "Owner 可添加账号、设置领导关系与访问范围。Research Center Director 与 Owner 可看所有人。",
    governanceWarningTitle: "高影响设置", governanceWarningText: "账号、领导关系与访问范围会影响人员信息可见性。保存前系统会要求再次确认。",
    hrbpSetupHint: "HRBP 设置：新增或编辑账号时选择 HRBP 角色，然后在右侧 HRBP 面板里分配其覆盖 Team。",
    businessLeadership: "业务主管", hrbpManagement: "HRBP Team 覆盖范围", assignedPeople: "负责员工", assignedTeams: "覆盖 Team", saveHrbpPeople: "保存 HRBP Team",
    organizationSettings: "组织设置", mainInstitute: "主研究所", newSubInstitute: "新增下属研究所",
    teamManagement: "团队筛选", newTeam: "新增团队", appName: "人才管理系统", totalPeople: "总人数",
    regularEmployees: "Employee", avgTenureYears: "平均在职年", searchPeople: "搜索人员",
    searchPlaceholder: "工号、姓名、岗位、团队、合同类型、优秀标签",
    addEmployee: "添加人员", orgChart: "组织架构图", permissionNotes: "权限说明", peopleInsights: "人员统计洞察", peopleInsightsHint: "统计会跟随当前 Business Unit / Team / 搜索筛选变化。", currentAccess: "当前权限范围",
    labFilter: "Business Unit 筛选", bulkImportEmployees: "批量导入员工", bulkImportHint: "支持 Excel 复制粘贴或 CSV / TSV 文件。",
    importFile: "上传 CSV / TSV", importMode: "导入方式", importUpsert: "按工号新增或更新", importAddOnly: "只新增不存在工号",
    pasteExcelData: "粘贴 Excel 表格", importEmployees: "导入员工", clear: "清空", downloadTemplate: "下载模板",
    importPlaceholder: "employeeNo,name,businessUnit,team,role,level,contractType,startDate,notes",
    importColumnsHint: "推荐列：employeeNo, name, businessUnit, team, role, level, contractType, startDate, notes。team 可填 Team 名称；如有重名 Team，建议同时填写 businessUnit。",
    importNoData: "请先选择文件或粘贴 Excel 表格。", importDone: "导入完成：新增 {added} 人，更新 {updated} 人，跳过 {skipped} 行。",
    importMissingColumns: "导入失败：至少需要 employeeNo、name，以及 teamId 或 team。",
    managerCoverage: "授权账号覆盖", contractBreakdown: "合同类型分布", levelBreakdown: "职级分布", orgBreakdown: "组织人数分布", talentStats: "人才标签与奖项",
    avgLevel: "平均职级", seniorTalent: "高级人才", leaderCount: "负责人", formerArchiveCount: "离职档案",
    taggedPeople: "有优秀标签", awardedPeople: "有获奖记录", growthPeople: "有成长轨迹",
    add: "添加", delete: "删除", deleteEmployee: "删除人员", cancel: "取消", save: "保存", employee: "员工", deleteReason: "删除 / 离职原因", archiveEmployee: "确认归档", deleteEmployeeHint: "该操作会将员工转入已离职员工档案，并保留原因记录。", employeeArchived: "员工已转入已离职员工档案。",
    employeeNo: "工号", name: "姓名", team: "Team", role: "岗位", level: "职级", contractType: "合同类型",
    startDate: "入职日期", institute: "Business Unit", businessUnit: "Business Unit",
    assignedManager: "负责账号", notes: "备注", basicInfo: "基础信息", editBasicInfo: "编辑基础信息", saveBasicInfo: "保存基础信息", ownerManagement: "Owner 管理",
    assignManager: "分配 Team Lead", saveAssignment: "保存分配", managerRecords: "主管记录", talentInsights: "人才洞察",
    newTalentRecord: "新增记录", newManagerRecord: "新增主管记录", newTalentInsight: "新增人才洞察", recordType: "记录类型", recordDate: "记录日期", content: "内容",
    managerAchievement: "优秀事迹", managerPerformance: "平时表现", talentInsight: "人才洞察", talentRisk: "人才风险", developmentSuggestion: "培养建议",
    addRecord: "添加记录", allTeams: "全部团队", allUnits: "全部 Business Unit", peopleUnit: "人", noManager: "暂不分配",
    noMatchedPeople: "暂无匹配人员。", notFilled: "未填写", noNotes: "暂无备注", tenure: "在职时长",
    recordCount: "条人才记录", canAdd: "可添加", readOnly: "只读", noRecords: "暂无人才记录。",
    loginFailed: "邮箱或密码不正确。", loginNoRole: "登录成功，但该邮箱还没有在系统里配置角色权限。请 Owner 在设置里添加同邮箱账号。", loginServiceUnavailable: "登录服务暂时无响应，请检查网络、Supabase 用户是否已创建，或稍后重试。", remoteLoadFailed: "无法读取 Supabase 共享数据，请确认 app_state 表和 RLS policy 已创建。", remoteSaveFailed: "保存到 Supabase 失败，请稍后重试。", demoHint: "请使用 Supabase 中已创建且已授权的邮箱登录；救援账号：owner1@example.com / owner123。",
    ownerPermission: "Owner 可添加/删除员工、创建邮箱账号并授权；Research Center Director 可查看所有员工。",
    directorPermission: "Research Center Director 可查看所有 Lab、Platform、Team 与全部人员详情。",
    labPermission: "Lab Director / PLR 可查看其 Lab 下所有 Team 和人员详情。",
    teamPermission: "Team Lead 只能查看自己 Team 的人员，并添加主管记录。",
    overviewPage: "组织 Overview",
    peoplePage: "人员目录",
    adminPage: "领导关系与权限",
    talentDevelopmentPage: "人才发展",
    developmentTree: "人才发展树", developmentTreeHint: "按 Lab / Platform 展开查看组织和 Team 的重点工作、目标与活动。",
    settings: "设置",
    orgOverviewHint: "每个 Team 展示人数与成员预览，点击查看完整名单。",
    teamFilter: "Team 筛选",
    adminHint: "账号授权表单在左侧 Owner 区域，后续可以做成完整后台页面。",
    members: "成员",
    memberPreview: "成员预览",
    viewTeam: "查看 Team",
    showingPeople: "显示 {shown} / {total} 人",
    loadMore: "加载更多",
    orgEditor: "组织编辑", unitType: "Business Unit 类型", unitName: "Business Unit 名称", addUnit: "新增 Business Unit",
    parentUnit: "所属 Business Unit", teamName: "Team 名称", addTeam: "新增 Team", orgEditHint: "一级结构包括 Research Lab、Independent Research Team、Platform。独立研究 Team 是一级节点，也可直接承载人员；有人员的节点不能直接删除。",
    researchLab: "Research Lab", independentResearchTeam: "Independent Research Team", platformUnit: "Platform", businessUnits: "Business Units", createBusinessUnit: "创建 Business Unit", createTeamUnderUnit: "创建下级 Team", noTeamsUnderStandalone: "独立研究 Team 本身就是 Team，不需要再添加下级 Team。",
    annualWorkGoals: "年度重点与目标", annualWorkHint: "记录各 Lab / Team 当年的主要工作和目标。", targetScope: "记录对象", goalYear: "年份", mainWork: "主要工作", mainGoals: "主要目标", saveGoal: "保存目标",
    cultureActivities: "氛围建设", cultureHint: "记录团队活动、峰会参与、分享会和跨团队协作。", activityType: "活动类型", activityDate: "日期", participants: "参与人数", activitySummary: "活动记录", addActivity: "添加活动",
    talentDashboard: "人才发展概览", talentDashboardHint: "借鉴常见 HCM 做法，关注关键人才、行动计划、继任准备和保留风险。",
    keyTalentCount: "关键/高潜人才", actionOpenCount: "进行中行动", retentionRiskCount: "保留风险", successorCount: "继任/备份人选",
    talentActionPlan: "人才行动计划", talentActionHint: "记录 IDP、继任、关键岗位备份、保留风险和学习发展动作。",
    actionPerson: "对象员工", actionType: "行动类型", actionPriority: "优先级", actionStatus: "状态", actionDueDate: "目标日期", actionNote: "行动说明", addTalentAction: "添加人才行动", multiSelectPeopleHint: "可按 Ctrl/Cmd 或 Shift 多选员工。",
    priorityHigh: "高", priorityMedium: "中", priorityLow: "低", statusOpen: "进行中", statusDone: "已完成", statusWatch: "观察中",
    noTalentActions: "暂无人才行动计划。", openTalentActions: "进行中人才行动", confirmTalentAction: "为 {name} 添加人才行动", confirmTalentActions: "为 {count} 名员工添加人才行动",
    talentSettings: "人才标签设置", newTalentTag: "新增优秀标签", newAwardName: "新增奖项名称", addTag: "添加标签", addAwardName: "添加奖项",
    developmentSettings: "人才发展设置", newActionType: "新增行动类型", newActivityType: "新增活动类型", addActionType: "添加行动类型", addActivityType: "添加活动类型",
    actionTypeSettings: "行动类型", activityTypeSettings: "活动类型", archive: "存档", archived: "已存档", edit: "编辑", updateTalentAction: "更新人才行动",
    talentHighlights: "优秀标签与获奖记录", talentTag: "优秀标签", awardName: "奖项名称", awardDate: "获奖日期", awardNote: "说明", addAward: "添加奖项",
    editTalentHighlights: "添加 / 编辑标签与奖项", editGrowthPath: "添加成长轨迹",
    growthPath: "成长轨迹", growthType: "成长类型", growthDate: "日期", growthNote: "成长记录", addGrowth: "添加成长记录",
    employeeMigration: "员工组织迁移", employeeMigrationHint: "删除组织前，可先把员工批量或单个迁移到保留的 Team。", sourceTeam: "来源 Team", targetTeam: "目标 Team", moveSelectedPeople: "迁移选中员工", moveAllPeople: "迁移该 Team 全部员工", bulkMoveOptions: "批量迁移选项", bulkMoveHint: "该操作会迁移来源 Team 的全部员工，请谨慎确认。",
    bulkArchiveEmployees: "批量归档员工", bulkArchiveHint: "批量将员工转入已离职员工档案。", archiveSelectedEmployees: "归档选中员工", formerEmployeeArchive: "已离职员工档案", formerEmployeeHint: "查看和导出已归档员工记录。", downloadArchive: "下载档案", confirmArchiveEmployees: "将 {count} 名员工转入已离职员工档案", employeesArchived: "{count} 名员工已转入已离职员工档案。", basicInfoSaved: "基础信息已保存。", invalidEmployeeNo: "工号格式与合同类型不匹配。Employee 必须为 00 开头 8 位；Leased Labour 为 84 或 wx 开头；Intern 为 500 开头。",
    noTags: "暂无标签", noAwards: "暂无获奖记录", noGrowth: "暂无成长记录", noGoals: "暂无年度重点记录。", noActivities: "暂无氛围建设记录。",
    cannotDeleteTeam: "该 Team 下还有人员，不能删除。", cannotDeleteUnit: "该组织下还有 Team，不能删除。",
    confirmChange: "请确认是否提交以下变更：\n{action}\n\n该操作将写入系统数据，可能影响员工档案、权限范围或组织配置。\n提交后无法自动还原，请确认信息准确无误。", validationRequired: "请填写必填字段。", duplicateEmail: "该邮箱已存在。", duplicateEmployeeNo: "该工号已存在。",
    passwordMismatch: "两次输入的新密码不一致。", currentPasswordWrong: "当前密码不正确。", passwordTooShort: "新密码至少需要 6 位。", confirmPasswordChange: "修改当前登录账号密码",
    deleteAccount: "删除账号", cannotDeleteCurrent: "不能删除当前登录账号。", cannotDeleteLastOwner: "至少需要保留一个 Owner 账号。", cannotDeleteLastType: "至少需要保留一个类型。", accountInUse: "该账号仍被组织结构引用，不能删除。",
    confirmAddAccount: "添加账号 {email}", confirmDeleteAccount: "删除账号 {email}", confirmAddUnit: "新增组织 {name}", confirmAddTeam: "新增 Team {name}",
    confirmDeleteTeam: "删除 Team {name}", confirmDeleteUnit: "删除组织 {name}", confirmDeleteEmployee: "将员工 {name} 转入已离职员工档案", confirmManager: "保存 Team Lead 分配",
    confirmGoal: "保存 {scope} 的年度重点", confirmActivity: "添加 {scope} 的氛围活动", confirmTag: "添加标签 {name}", confirmAwardName: "添加奖项 {name}", confirmActionType: "添加行动类型 {name}", confirmActivityType: "添加活动类型 {name}", confirmPersonTag: "为 {name} 添加标签", confirmAward: "为 {name} 添加获奖记录", confirmGrowth: "为 {name} 添加成长记录",
    confirmMovePeople: "将 {count} 名员工迁移到 {team}",
    centerDirector: "Research Center Director", labDirector: "Lab Director", platformLead: "Platform Lead", teamManager: "Team Lead",
    viewAs: "Owner 视角", viewAsCenter: "全研究所", editAccount: "编辑账号", saveAccount: "保存账号", confirmEditAccount: "保存账号 {email} 的权限",
    unsavedChanges: "未保存更改", accountCreated: "账号已创建并保存。", accountSaved: "账号变更已保存。", accountDeleted: "账号已删除。", hrbpTeamsSaved: "HRBP 覆盖范围已保存。", passwordSaved: "密码已保存。",
  },
  en: {
    loginTitle: "Sign In", email: "Email", password: "Password", login: "Sign In", logout: "Sign Out",
    changePassword: "Change Password", currentPassword: "Current Password", newPassword: "New Password", confirmNewPassword: "Confirm New Password", savePassword: "Save Password", temporaryPassword: "Temporary Password",
    language: "Language / 语言", accountsAndPermissions: "Leadership & HRBP Coverage",
    accountName: "Account Name", permissionRole: "Permission Role", scope: "Scope", addAccount: "Add Account",
    ownerCanAssign: "Owners can add accounts, set leadership relationships, and authorize access scope. Research Center Directors and Owners can see everyone.",
    governanceWarningTitle: "High-impact settings", governanceWarningText: "Accounts, leadership relationships, and access scope affect employee data visibility. The system will ask for confirmation before saving.",
    hrbpSetupHint: "HRBP setup: create or edit an account with the HRBP role, then assign covered teams in the HRBP panel on the right.",
    businessLeadership: "Business Leadership", hrbpManagement: "HRBP Team Coverage", assignedPeople: "Assigned People", assignedTeams: "Covered Teams", saveHrbpPeople: "Save HRBP Teams",
    organizationSettings: "Organization Settings", mainInstitute: "Main Institute", newSubInstitute: "New Sub-Institute",
    teamManagement: "Team Filter", newTeam: "New Team", appName: "Talent Management System", totalPeople: "Total People",
    regularEmployees: "Regular Employees", avgTenureYears: "Avg Tenure Years", searchPeople: "Search People",
    searchPlaceholder: "Employee ID, name, role, team, contract type, talent tag",
    addEmployee: "Add Employee", orgChart: "Org Chart", permissionNotes: "Permission Notes", peopleInsights: "People Insights", peopleInsightsHint: "Stats follow the current Business Unit / Team / search filters.", currentAccess: "Current Access Scope",
    labFilter: "Business Unit Filter", bulkImportEmployees: "Bulk Import Employees", bulkImportHint: "Supports Excel copy-paste or CSV / TSV files.",
    importFile: "Upload CSV / TSV", importMode: "Import Mode", importUpsert: "Add or update by Employee ID", importAddOnly: "Only add new Employee IDs",
    pasteExcelData: "Paste Excel table", importEmployees: "Import Employees", clear: "Clear", downloadTemplate: "Download Template",
    importPlaceholder: "employeeNo,name,businessUnit,team,role,level,contractType,startDate,notes",
    importColumnsHint: "Recommended columns: employeeNo, name, businessUnit, team, role, level, contractType, startDate, notes. Use businessUnit when team names may repeat.",
    importNoData: "Choose a file or paste Excel data first.", importDone: "Import complete: {added} added, {updated} updated, {skipped} skipped.",
    importMissingColumns: "Import failed: employeeNo, name, and teamId or team are required.",
    managerCoverage: "Account Coverage", contractBreakdown: "Contract Breakdown", levelBreakdown: "Level Breakdown", orgBreakdown: "Org Headcount", talentStats: "Talent Tags & Awards",
    avgLevel: "Avg Level", seniorTalent: "Senior Talent", leaderCount: "Leaders", formerArchiveCount: "Former Archive",
    taggedPeople: "Tagged people", awardedPeople: "Awarded people", growthPeople: "Growth records",
    add: "Add", delete: "Delete", deleteEmployee: "Delete Employee", cancel: "Cancel", save: "Save", employee: "Employee", deleteReason: "Delete / departure reason", archiveEmployee: "Archive Employee", deleteEmployeeHint: "This moves the employee into the former employee archive and keeps the reason.", employeeArchived: "Employee moved to former employee archive.",
    employeeNo: "Employee ID", name: "Name", team: "Team", role: "Role", level: "Level", contractType: "Contract Type",
    startDate: "Start Date", institute: "Business Unit", businessUnit: "Business Unit",
    assignedManager: "Responsible Account", notes: "Notes", basicInfo: "Basic Info", editBasicInfo: "Edit Basic Info", saveBasicInfo: "Save Basic Info", ownerManagement: "Owner Management",
    assignManager: "Assign Team Lead", saveAssignment: "Save Assignment", managerRecords: "Manager Records", talentInsights: "Talent Insights",
    newTalentRecord: "New Record", newManagerRecord: "New Manager Record", newTalentInsight: "New Talent Insight", recordType: "Record Type", recordDate: "Record Date", content: "Content",
    managerAchievement: "Achievement", managerPerformance: "Performance Note", talentInsight: "Talent Insight", talentRisk: "Talent Risk", developmentSuggestion: "Development Suggestion",
    addRecord: "Add Record", allTeams: "All Teams", allUnits: "All Business Units", peopleUnit: "people", noManager: "No manager",
    noMatchedPeople: "No matching people.", notFilled: "Not filled", noNotes: "No notes", tenure: "Tenure",
    recordCount: "talent records", canAdd: "Can add", readOnly: "Read only", noRecords: "No talent records yet.",
    loginFailed: "Email or password is incorrect.", loginNoRole: "Sign-in succeeded, but this email has no role in Team Management. Ask an Owner to add the same email in Settings.", loginServiceUnavailable: "The login service is not responding. Check the network, Supabase user setup, or try again later.", remoteLoadFailed: "Cannot load shared Supabase data. Check that the app_state table and RLS policies exist.", remoteSaveFailed: "Failed to save to Supabase. Please try again.", demoHint: "Use a Supabase email that is authorized in settings. Rescue login: owner1@example.com / owner123.",
    ownerPermission: "Owners can add/delete employees, create email accounts, and authorize scope. Research Center Directors can view all employees.",
    directorPermission: "Research Center Directors can view all Labs, Platforms, Teams, and employee details.",
    labPermission: "Lab Directors / PLRs can view all teams and employee details under their Lab.",
    teamPermission: "Team Leads can only view their own team's employees and add manager records.",
    overviewPage: "Org Overview",
    peoplePage: "People Directory",
    adminPage: "Leadership & Access",
    talentDevelopmentPage: "Talent Development",
    developmentTree: "Talent Development Tree", developmentTreeHint: "Expand each Lab / Platform to view org and team work, goals, and activities.",
    settings: "Settings",
    orgOverviewHint: "Each team shows headcount and a member preview. Click a team to view the full roster.",
    teamFilter: "Team Filter",
    adminHint: "Account authorization is currently in the left Owner area and can become a full admin page next.",
    members: "members",
    memberPreview: "Member Preview",
    viewTeam: "View Team",
    showingPeople: "Showing {shown} / {total}",
    loadMore: "Load more",
    orgEditor: "Org Editor", unitType: "Business Unit Type", unitName: "Business Unit Name", addUnit: "Add Business Unit",
    parentUnit: "Parent Business Unit", teamName: "Team Name", addTeam: "Add Team", orgEditHint: "Top-level structure includes Research Labs, Independent Research Teams, and Platforms. An independent research team is a top-level node and can directly hold employees. Nodes with employees cannot be deleted.",
    researchLab: "Research Lab", independentResearchTeam: "Independent Research Team", platformUnit: "Platform", businessUnits: "Business Units", createBusinessUnit: "Create Business Unit", createTeamUnderUnit: "Create Team", noTeamsUnderStandalone: "An independent research team is itself a team, so no child team is needed.",
    annualWorkGoals: "Annual Work & Goals", annualWorkHint: "Record each Lab / Team's major work and goals for the year.", targetScope: "Scope", goalYear: "Year", mainWork: "Major Work", mainGoals: "Main Goals", saveGoal: "Save Goal",
    cultureActivities: "Culture & Engagement", cultureHint: "Record team events, summits, talks, and cross-team collaboration.", activityType: "Activity Type", activityDate: "Date", participants: "Participants", activitySummary: "Activity Notes", addActivity: "Add Activity",
    talentDashboard: "Talent Development Overview", talentDashboardHint: "Inspired by common HCM practices: key talent, action plans, succession readiness, and retention risk.",
    keyTalentCount: "Key / high-potential people", actionOpenCount: "Open actions", retentionRiskCount: "Retention risks", successorCount: "Successor / backup candidates",
    talentActionPlan: "Talent Action Plan", talentActionHint: "Track IDP, succession, key-role backup, retention risk, and learning actions.",
    actionPerson: "Employees", actionType: "Action Type", actionPriority: "Priority", actionStatus: "Status", actionDueDate: "Due Date", actionNote: "Action Note", addTalentAction: "Add Talent Action", multiSelectPeopleHint: "Hold Ctrl/Cmd or Shift to select multiple employees.",
    priorityHigh: "High", priorityMedium: "Medium", priorityLow: "Low", statusOpen: "Open", statusDone: "Done", statusWatch: "Watch",
    noTalentActions: "No talent action plans yet.", openTalentActions: "Open talent actions", confirmTalentAction: "Add talent action for {name}", confirmTalentActions: "Add talent action for {count} employees",
    talentSettings: "Talent Tag Settings", newTalentTag: "New Talent Tag", newAwardName: "New Award Name", addTag: "Add Tag", addAwardName: "Add Award Name",
    developmentSettings: "Talent Development Settings", newActionType: "New Action Type", newActivityType: "New Activity Type", addActionType: "Add Action Type", addActivityType: "Add Activity Type",
    actionTypeSettings: "Action Types", activityTypeSettings: "Activity Types", archive: "Archive", archived: "Archived", edit: "Edit", updateTalentAction: "Update Talent Action",
    talentHighlights: "Talent Tags & Awards", talentTag: "Talent Tag", awardName: "Award Name", awardDate: "Award Date", awardNote: "Note", addAward: "Add Award",
    editTalentHighlights: "Add / Edit Tags & Awards", editGrowthPath: "Add Growth Path",
    growthPath: "Growth Path", growthType: "Growth Type", growthDate: "Date", growthNote: "Growth Note", addGrowth: "Add Growth Record",
    employeeMigration: "Employee Org Migration", employeeMigrationHint: "Before deleting an org node, move employees to the team you want to keep.", sourceTeam: "Source Team", targetTeam: "Target Team", moveSelectedPeople: "Move Selected People", moveAllPeople: "Move All From Team", bulkMoveOptions: "Bulk Move Options", bulkMoveHint: "This will move every employee in the source team. Please confirm carefully.",
    bulkArchiveEmployees: "Bulk Archive Employees", bulkArchiveHint: "Move multiple employees into the former employee archive.", archiveSelectedEmployees: "Archive Selected Employees", formerEmployeeArchive: "Former Employee Archive", formerEmployeeHint: "View and export archived employee records.", downloadArchive: "Download Archive", confirmArchiveEmployees: "Move {count} employees to the former employee archive", employeesArchived: "{count} employees moved to the former employee archive.", basicInfoSaved: "Basic info saved.", invalidEmployeeNo: "Employee ID does not match the contract type. Employee must be 8 digits starting with 00; Leased Labour starts with 84 or wx; Intern starts with 500.",
    noTags: "No tags yet", noAwards: "No awards yet", noGrowth: "No growth records yet", noGoals: "No annual work records yet.", noActivities: "No culture activities yet.",
    cannotDeleteTeam: "This team has employees and cannot be deleted.", cannotDeleteUnit: "This unit still has teams and cannot be deleted.",
    confirmChange: "Please confirm the following change:\n{action}\n\nThis operation writes to system data and may affect employee records, access scope, or org configuration.\nAfter submission, it cannot be automatically restored. Please verify the information before continuing.", validationRequired: "Please complete required fields.", duplicateEmail: "This email already exists.", duplicateEmployeeNo: "This Employee ID already exists.",
    passwordMismatch: "The new passwords do not match.", currentPasswordWrong: "The current password is incorrect.", passwordTooShort: "The new password must be at least 6 characters.", confirmPasswordChange: "Change the signed-in account password",
    deleteAccount: "Delete Account", cannotDeleteCurrent: "You cannot delete the signed-in account.", cannotDeleteLastOwner: "At least one Owner account must remain.", cannotDeleteLastType: "At least one type must remain.", accountInUse: "This account is still referenced by the org structure.",
    confirmAddAccount: "Add account {email}", confirmDeleteAccount: "Delete account {email}", confirmAddUnit: "Add org unit {name}", confirmAddTeam: "Add team {name}",
    confirmDeleteTeam: "Delete team {name}", confirmDeleteUnit: "Delete org unit {name}", confirmDeleteEmployee: "Move employee {name} to the former employee archive", confirmManager: "Save Team Lead assignment",
    confirmGoal: "Save annual work for {scope}", confirmActivity: "Add culture activity for {scope}", confirmTag: "Add tag {name}", confirmAwardName: "Add award name {name}", confirmActionType: "Add action type {name}", confirmActivityType: "Add activity type {name}", confirmPersonTag: "Add tag for {name}", confirmAward: "Add award for {name}", confirmGrowth: "Add growth record for {name}",
    confirmMovePeople: "Move {count} employees to {team}",
    centerDirector: "Research Center Director", labDirector: "Lab Director", platformLead: "Platform Lead", teamManager: "Team Lead",
    viewAs: "Owner View As", viewAsCenter: "Whole Research Center", editAccount: "Edit Account", saveAccount: "Save Account", confirmEditAccount: "Save permissions for {email}",
    unsavedChanges: "Unsaved changes", accountCreated: "Account created and saved.", accountSaved: "Account changes saved.", accountDeleted: "Account deleted.", hrbpTeamsSaved: "HRBP coverage saved.", passwordSaved: "Password saved.",
  },
};

let state = normalizeState(loadState());
let activePersonId = "";
let editingTalentActionId = "";
let editingBasicInfo = false;
const supabaseClient = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_ANON_KEY) || null;
let remoteStateLoaded = false;
let remoteStateWasEmpty = false;
let remoteSaveTimer = 0;
let suppressRemoteSave = false;
let isSavingRemote = false;
let remoteAuthEmail = "";

const $ = (selector) => document.querySelector(selector);
const elements = {
  loginView: $("#loginView"), loginForm: $("#loginForm"), loginError: $("#loginError"), demoLoginHint: $("#demoLoginHint"), loginLanguageSwitcher: $("#loginLanguageSwitcher"),
  languageSwitcher: $("#languageSwitcher"), signedInName: $("#signedInName"), signedInMeta: $("#signedInMeta"), logoutBtn: $("#logoutBtn"), settingsBtn: $("#settingsBtn"),
  currentPasswordInput: $("#currentPasswordInput"), newPasswordInput: $("#newPasswordInput"), confirmPasswordInput: $("#confirmPasswordInput"), changePasswordBtn: $("#changePasswordBtn"),
  settingsDialog: $("#settingsDialog"), settingsForm: $("#settingsForm"), closeSettingsBtn: $("#closeSettingsBtn"),
  accountList: $("#accountList"), hrbpAssignmentList: $("#hrbpAssignmentList"), businessAccountForm: $("#businessAccountForm"), hrbpAccountForm: $("#hrbpAccountForm"), newAccountName: $("#newAccountName"), newAccountEmail: $("#newAccountEmail"), newAccountPassword: $("#newAccountPassword"), newAccountRole: $("#newAccountRole"), newAccountScope: $("#newAccountScope"), addManagerBtn: $("#addManagerBtn"),
  newUnitType: $("#newUnitType"), newUnitName: $("#newUnitName"), unitNameLabel: $("#unitNameLabel"), addUnitBtn: $("#addUnitBtn"), newTeamUnit: $("#newTeamUnit"), newTeamName: $("#newTeamName"), addOrgTeamBtn: $("#addOrgTeamBtn"), orgEditList: $("#orgEditList"),
  moveSourceTeam: $("#moveSourceTeam"), moveTargetTeam: $("#moveTargetTeam"), moveSelectedPeopleBtn: $("#moveSelectedPeopleBtn"), moveAllPeopleBtn: $("#moveAllPeopleBtn"), movePeopleList: $("#movePeopleList"),
  bulkArchiveReason: $("#bulkArchiveReason"), bulkArchiveEmployeesBtn: $("#bulkArchiveEmployeesBtn"), bulkArchivePeopleList: $("#bulkArchivePeopleList"), formerEmployeeList: $("#formerEmployeeList"), downloadFormerEmployeesBtn: $("#downloadFormerEmployeesBtn"),
  goalScopeSelect: $("#goalScopeSelect"), goalYear: $("#goalYear"), mainWorkInput: $("#mainWorkInput"), mainGoalsInput: $("#mainGoalsInput"), addGoalBtn: $("#addGoalBtn"), goalList: $("#goalList"),
  activityScopeSelect: $("#activityScopeSelect"), activityType: $("#activityType"), activityDate: $("#activityDate"), activityParticipants: $("#activityParticipants"), activitySummary: $("#activitySummary"), addActivityBtn: $("#addActivityBtn"), activityList: $("#activityList"),
  talentDashboard: $("#talentDashboard"), talentUnitFilter: $("#talentUnitFilter"), talentTeamFilter: $("#talentTeamFilter"), talentActionPerson: $("#talentActionPerson"), talentActionType: $("#talentActionType"), talentActionPriority: $("#talentActionPriority"), talentActionStatus: $("#talentActionStatus"), talentActionDueDate: $("#talentActionDueDate"), talentActionNote: $("#talentActionNote"), addTalentActionBtn: $("#addTalentActionBtn"), talentActionList: $("#talentActionList"),
  developmentTree: $("#developmentTree"),
  newTalentTag: $("#newTalentTag"), newAwardName: $("#newAwardName"), addTalentTagBtn: $("#addTalentTagBtn"), addAwardNameBtn: $("#addAwardNameBtn"), talentSettingList: $("#talentSettingList"),
  newActionType: $("#newActionType"), newActivityType: $("#newActivityType"), addActionTypeBtn: $("#addActionTypeBtn"), addActivityTypeBtn: $("#addActivityTypeBtn"), developmentSettingList: $("#developmentSettingList"),
  instituteName: $("#instituteName"), labList: $("#labList"), teamList: $("#teamList"), pageTitle: $("#pageTitle"), pageSubtitle: $("#pageSubtitle"), totalPeople: $("#totalPeople"), regularPeople: $("#regularPeople"), avgTenure: $("#avgTenure"),
  searchInput: $("#searchInput"), showAddPersonBtn: $("#showAddPersonBtn"), showDeletePersonBtn: $("#showDeletePersonBtn"), orgChart: $("#orgChart"),
  employeeImportFile: $("#employeeImportFile"), employeeImportMode: $("#employeeImportMode"), employeeImportText: $("#employeeImportText"), importEmployeesBtn: $("#importEmployeesBtn"), clearImportBtn: $("#clearImportBtn"), downloadImportTemplateBtn: $("#downloadImportTemplateBtn"), employeeImportResult: $("#employeeImportResult"),
  pageTabs: document.querySelectorAll(".page-tab"), pagePanels: document.querySelectorAll(".page-panel"), overviewTeamTitle: $("#overviewTeamTitle"), overviewTeamCount: $("#overviewTeamCount"), overviewTeamRoster: $("#overviewTeamRoster"),
  selectedTeamTitle: $("#selectedTeamTitle"), selectedTeamCount: $("#selectedTeamCount"), peopleGrid: $("#peopleGrid"), permissionHint: $("#permissionHint"), contractBreakdown: $("#contractBreakdown"), levelBreakdown: $("#levelBreakdown"), orgBreakdown: $("#orgBreakdown"), talentStats: $("#talentStats"),
  personDialog: $("#personDialog"), personForm: $("#personForm"), closeDialogBtn: $("#closeDialogBtn"), cancelPersonBtn: $("#cancelPersonBtn"),
  deleteEmployeeDialog: $("#deleteEmployeeDialog"), deleteEmployeeForm: $("#deleteEmployeeForm"), closeDeleteEmployeeBtn: $("#closeDeleteEmployeeBtn"), cancelDeleteEmployeeBtn: $("#cancelDeleteEmployeeBtn"),
  profileDialog: $("#profileDialog"), profileForm: $("#profileForm"), profileName: $("#profileName"), profileMeta: $("#profileMeta"), profileBasics: $("#profileBasics"), editBasicInfoBtn: $("#editBasicInfoBtn"), profileManager: $("#profileManager"), saveProfileManagerBtn: $("#saveProfileManagerBtn"),
  profileTalentActions: $("#profileTalentActions"), profileTalentActionEditor: $("#profileTalentActionEditor"), profileTalentActionType: $("#profileTalentActionType"), profileTalentActionPriority: $("#profileTalentActionPriority"), profileTalentActionStatus: $("#profileTalentActionStatus"), profileTalentActionDueDate: $("#profileTalentActionDueDate"), profileTalentActionNote: $("#profileTalentActionNote"), addProfileTalentActionBtn: $("#addProfileTalentActionBtn"),
  personTalentTags: $("#personTalentTags"), personAwards: $("#personAwards"), talentEditor: $("#talentEditor"), talentTagSelect: $("#talentTagSelect"), awardNameSelect: $("#awardNameSelect"), awardDate: $("#awardDate"), awardNote: $("#awardNote"), addPersonTagBtn: $("#addPersonTagBtn"), addAwardBtn: $("#addAwardBtn"),
  growthTimeline: $("#growthTimeline"), growthEditor: $("#growthEditor"), growthType: $("#growthType"), growthDate: $("#growthDate"), growthNote: $("#growthNote"), addGrowthBtn: $("#addGrowthBtn"),
  managerRecordList: $("#managerRecordList"), managerRecordPermissionText: $("#managerRecordPermissionText"), managerRecordEditor: $("#managerRecordEditor"), managerRecordType: $("#managerRecordType"), managerRecordDate: $("#managerRecordDate"), managerRecordContent: $("#managerRecordContent"), addManagerRecordBtn: $("#addManagerRecordBtn"),
  talentInsightList: $("#talentInsightList"), talentInsightPermissionText: $("#talentInsightPermissionText"), talentInsightEditor: $("#talentInsightEditor"), talentInsightType: $("#talentInsightType"), talentInsightDate: $("#talentInsightDate"), talentInsightContent: $("#talentInsightContent"), addTalentInsightBtn: $("#addTalentInsightBtn"), closeProfileBtn: $("#closeProfileBtn"),
  toast: $("#toast"),
};

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (!legacy) return structuredClone(defaultState);
  return migrateLegacy(JSON.parse(legacy));
}

function migrateLegacy(legacy) {
  const next = structuredClone(defaultState);
  next.language = legacy.language === "en" ? "en" : "zh";
  next.searchText = legacy.searchText || "";
  if (Array.isArray(legacy.people)) {
    next.people = legacy.people.map((person, index) => ({
      id: person.id || `p-${index + 1}`,
      employeeNo: person.employeeNo || `00${String(123456 + index).padStart(6, "0")}`,
      name: person.name || "",
      teamId: teamExists(person.teamId, next.org) ? person.teamId : "team-1",
      role: person.role || "",
      level: person.level || "未填写",
      contractType: normalizeContractType(person.contractType),
      startDate: person.startDate || "2024-01-01",
      notes: person.notes || "",
      talentTags: Array.isArray(person.talentTags) ? person.talentTags : [],
      awards: Array.isArray(person.awards) ? person.awards : [],
      growth: Array.isArray(person.growth) ? person.growth : [],
      records: Array.isArray(person.records) ? person.records : [],
    }));
  }
  return next;
}

function normalizeState(raw) {
  const next = { ...structuredClone(defaultState), ...raw };
  next.org = raw.org || structuredClone(defaultState.org);
  next.accounts = Array.isArray(raw.accounts) ? raw.accounts : structuredClone(defaultState.accounts);
  next.accounts = next.accounts.map((account) => ({
    ...account,
    name: normalizedLeadershipAccountName(account),
    scopeIds: Array.isArray(account.scopeIds) ? account.scopeIds : account.role === "hrbp" && account.scopeId ? [account.scopeId] : undefined,
  }));
  next.people = Array.isArray(raw.people) ? raw.people : structuredClone(defaultState.people);
  next.talentTags = Array.isArray(raw.talentTags) ? raw.talentTags : structuredClone(defaultState.talentTags);
  next.awardNames = Array.isArray(raw.awardNames) ? raw.awardNames : structuredClone(defaultState.awardNames);
  next.talentActionTypes = Array.isArray(raw.talentActionTypes) ? raw.talentActionTypes : structuredClone(defaultState.talentActionTypes);
  next.cultureActivityTypes = Array.isArray(raw.cultureActivityTypes) ? raw.cultureActivityTypes : structuredClone(defaultState.cultureActivityTypes);
  next.orgGoals = Array.isArray(raw.orgGoals) ? raw.orgGoals : structuredClone(defaultState.orgGoals);
  next.cultureActivities = Array.isArray(raw.cultureActivities) ? raw.cultureActivities : structuredClone(defaultState.cultureActivities);
  next.talentActions = Array.isArray(raw.talentActions) ? raw.talentActions : structuredClone(defaultState.talentActions);
  next.formerPeople = Array.isArray(raw.formerPeople) ? raw.formerPeople : [];
  next.language = raw.language === "en" ? "en" : "zh";
  next.sessionAccountId = next.accounts.some((account) => account.id === raw.sessionAccountId) ? raw.sessionAccountId : "";
  next.selectedUnitId = raw.selectedUnitId || "all";
  next.selectedTeamId = raw.selectedTeamId || "all";
  next.selectedTalentUnitId = raw.selectedTalentUnitId || "all";
  next.selectedTalentTeamId = raw.selectedTalentTeamId || "all";
  next.selectedOverviewTeamId = raw.selectedOverviewTeamId || "team-1";
  next.activePage = ["adminPage", "adminActionsPage", "reviewCyclesPage"].includes(raw.activePage) ? "overviewPage" : raw.activePage || "overviewPage";
  next.peopleDisplayLimitMigrated = Boolean(raw.peopleDisplayLimitMigrated);
  if (!next.peopleDisplayLimitMigrated && (raw.peopleDisplayLimit || 50) >= 50) {
    next.peopleDisplayLimit = 24;
    next.peopleDisplayLimitMigrated = true;
  } else {
    next.peopleDisplayLimit = raw.peopleDisplayLimit || 24;
  }
  next.ownerViewScope = raw.ownerViewScope || { type: "center", id: "center-1" };
  ensureOwnerAccount(next);
  repairOrganizationState(next);
  repairHrbpTeamCoverage(next);
  ensureDemoHrbp(next);
  next.people = next.people.map((person) => ({
    ...person,
    contractType: normalizeContractType(person.contractType),
    talentTags: Array.isArray(person.talentTags) ? person.talentTags : [],
    awards: Array.isArray(person.awards) ? person.awards : [],
    growth: Array.isArray(person.growth) ? person.growth : [],
  }));
  removeHanNamedFakePeople(next);
  next.accounts.forEach((account) => syncAccountPersonForState(next, account));
  cleanLeadershipPeoplePlacement(next);
  rebalanceDemoStaffing(next);
  normalizePeopleIdentityFormats(next);
  return next;
}

function hasHanCharacters(value) {
  return /[\u3400-\u9FFF]/.test(String(value || ""));
}

function removeHanNamedFakePeople(targetState) {
  const removedIds = new Set();
  targetState.people = targetState.people.filter((person) => {
    const shouldRemove = !person.accountId && hasHanCharacters(person.name);
    if (shouldRemove) removedIds.add(person.id);
    return !shouldRemove;
  });
  targetState.formerPeople = (targetState.formerPeople || []).filter((person) => !(!person.accountId && hasHanCharacters(person.name)));
  if (removedIds.size) {
    targetState.talentActions = (targetState.talentActions || []).filter((action) => !removedIds.has(action.personId));
  }
}

function looksLikeRoleTitleName(name) {
  return /\b(Research Center Director|Lab Director|Platform Lead|Team Lead|Team Manager|PLR|Director)\b/i.test(String(name || ""));
}

function normalizedLeadershipAccountName(account) {
  const currentName = String(account.name || "").replaceAll("Team Managers", "Team Leads").replaceAll("Team Manager", "Team Lead");
  if (!looksLikeRoleTitleName(currentName)) return currentName;
  const fixedNames = {
    "research-director-1": "Elena Moreau",
    "lab-director-ai": "Matthias Keller",
    "plr-ai": "Sofia Romano",
    "team-manager-algo": "Nicolas Laurent",
    "team-manager-data": "Marta Kowalska",
    "team-manager-product": "Pieter Janssen",
    "team-manager-software": "Clara Fischer",
    "platform-lead-core": "Hannah Müller",
    "platform-lead-ops": "Luca Bianchi",
    "team-manager-hardware": "Oskar Andersen",
    "team-manager-quality": "Camille Bernard",
    "team-manager-user": "Javier Morales",
    "team-manager-ops": "Ines Dubois",
    "team-manager-strategy": "Jan Kowalski",
  };
  const fallbackByRole = {
    researchDirector: "Elena Moreau",
    labDirector: "Matthias Keller",
    plr: "Sofia Romano",
    platformLead: "Hannah Müller",
    teamManager: "Nicolas Laurent",
  };
  return fixedNames[account.id] || fallbackByRole[account.role] || currentName;
}

function isValidEmployeeNoForContract(employeeNo, contractType) {
  const value = String(employeeNo || "");
  if (contractType === "Employee") return /^00\d{6}$/.test(value);
  if (contractType === "Leased Labour") return /^(84\d{5}|wx\d{5})$/.test(value);
  if (contractType === "Intern") return /^500\d{5}$/.test(value);
  return false;
}

function nextFormattedEmployeeNo(contractType, usedEmployeeNos, index = 0) {
  const start = 123456 + index;
  for (let offset = 0; offset < 900000; offset += 1) {
    const serial = start + offset;
    const candidate = contractType === "Intern"
      ? `500${String(12000 + index + offset).padStart(5, "0")}`
      : contractType === "Leased Labour"
        ? (offset % 2 === 0 ? `84${String(12000 + index + offset).padStart(5, "0")}` : `wx${String(12000 + index + offset).padStart(5, "0")}`)
        : `00${String(serial).padStart(6, "0")}`;
    if (!usedEmployeeNos.has(candidate)) {
      usedEmployeeNos.add(candidate);
      return candidate;
    }
  }
  return `00${String(Date.now()).slice(-6)}`;
}

function normalizeLevelValue(value, index = 0) {
  const text = String(value || "").trim();
  if (/^\d+$/.test(text)) {
    const numeric = Number(text);
    if (numeric >= 13 && numeric <= 22) return String(numeric);
  }
  const mapped = {
    intern: "13",
    consultant: "15",
    "未填写": "13",
    "not filled": "13",
    p3: "13",
    p4: "14",
    p5: "15",
    p6: "16",
    p7: "17",
    p8: "18",
    m1: "19",
    m2: "20",
    m3: "21",
  }[text.toLowerCase()];
  return mapped || String(13 + (index % 10));
}

function normalizePeopleIdentityFormats(targetState) {
  const usedEmployeeNos = new Set();
  targetState.people = targetState.people.map((person, index) => {
    const contractType = normalizeContractType(person.contractType);
    const currentNo = String(person.employeeNo || "");
    const employeeNo = isValidEmployeeNoForContract(currentNo, contractType) && !usedEmployeeNos.has(currentNo)
      ? currentNo
      : nextFormattedEmployeeNo(contractType, usedEmployeeNos, index);
    usedEmployeeNos.add(employeeNo);
    return {
      ...person,
      employeeNo,
      contractType,
      level: normalizeLevelValue(person.level, index),
    };
  });
}

function leadershipLevelForRole(role) {
  return {
    researchDirector: "22",
    labDirector: "21",
    platformLead: "21",
    plr: "20",
    teamManager: "19",
    hrbp: "18",
  }[role] || "18";
}

function isDefaultLeadershipAccount(accountId) {
  return [
    "research-director-1",
    "lab-director-ai",
    "plr-ai",
    "team-manager-algo",
    "team-manager-data",
    "team-manager-product",
    "team-manager-software",
    "platform-lead-core",
    "platform-lead-ops",
  ].includes(accountId);
}

function unitByTeamForState(targetState, teamId) {
  return targetState.org.units.find((unit) => unit.teams.some((team) => team.id === teamId));
}

function ensurePeopleOperationsTeam(targetState) {
  let unit = targetState.org.units.find((item) => item.id === "platform-people-ops" || item.name === "People Operations");
  if (!unit) {
    unit = {
      id: "platform-people-ops",
      type: "platform",
      name: "People Operations",
      sponsor: "",
      directorAccountId: "",
      plrAccountId: "",
      teams: [{ id: "team-hr-ops", name: "HR Team", managerAccountId: "", primary: true }],
    };
    targetState.org.units.push(unit);
  }
  if (!unit.teams.some((team) => team.id === "team-hr-ops")) {
    unit.teams.unshift({ id: "team-hr-ops", name: "HR Team", managerAccountId: "", primary: true });
  }
  return "team-hr-ops";
}

function ensureTeam(unit, id, name) {
  const existing = unit.teams.find((team) => team.id === id || team.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing.id;
  unit.teams.push({ id, name, managerAccountId: "", primary: false });
  return id;
}

function ensureResearchOrgForDemo(targetState) {
  const ensureUnit = (name, type = "lab", matcher = null) => {
    let unit = targetState.org.units.find((item) => item.name.toLowerCase() === name.toLowerCase())
      || (matcher ? targetState.org.units.find((item) => matcher.test(item.name || "")) : null);
    if (!unit) {
      unit = { id: `${type}-${slugify(name)}`, type, name, sponsor: "", directorAccountId: "", plrAccountId: "", teams: [] };
      targetState.org.units.push(unit);
    }
    unit.name = name;
    unit.type = type;
    unit.teams = Array.isArray(unit.teams) ? unit.teams : [];
    return unit;
  };

  const wireless = ensureUnit("Wireless Lab", "lab", /^wireless( lab)?$/i);
  ensureTeam(wireless, "team-wireless-communication", "Wireless Communication Team");
  ensureTeam(wireless, "team-rf-systems", "RF Systems Team");
  ensureTeam(wireless, "team-device-connectivity", "Device Connectivity Team");

  const network = ensureUnit("Network Lab", "lab", /^network( lab)?$/i);
  ensureTeam(network, "team-network-architecture", "Network Architecture Team");
  ensureTeam(network, "team-cloud-network", "Cloud Network Team");
  ensureTeam(network, "team-network-security", "Network Security Team");

  const bayer = targetState.org.units.find((unit) => /bayer/i.test(unit.name || ""));
  if (bayer) {
    ensureTeam(bayer, "team-bayer-discovery", "Bayer Discovery Team");
    ensureTeam(bayer, "team-bayer-computational-biology", "Computational Biology Team");
  }

  let platform = targetState.org.units.find((unit) => unit.type === "platform" && /^platform$/i.test(unit.name || ""))
    || targetState.org.units.find((unit) => unit.type === "platform" && !/people operations/i.test(unit.name || ""))
    || ensureUnit("Platform", "platform");
  platform.type = "platform";
  ensureTeam(platform, "team-it", "IT Team");
}

function isPeopleOpsRole(person) {
  return /\b(HRBP|HR Specialist|Recruiting|Recruiter|People Partner|HR)\b/i.test(String(person.role || ""));
}

function leadershipRoleKey(person) {
  const role = String(person.role || "").toLowerCase();
  if (role.includes("research center director")) return "researchDirector";
  if (role.includes("lab director") || role.includes("platform lead")) return "unitDirector";
  if (role === "plr" || role.includes(" plr")) return "plr";
  if (role.includes("team lead") || role.includes("team manager")) return "teamLead";
  return "";
}

function keepBestLeadershipPerson(people, scope, key) {
  if (people.length <= 1) return new Set();
  const scored = people.map((person) => {
    const account = person.accountId ? stateAccountById(scope.targetState, person.accountId) : null;
    let score = 0;
    if (key === "unitDirector" && person.accountId && person.accountId === scope.unit?.directorAccountId) score += 120;
    if (key === "plr" && person.accountId && person.accountId === scope.unit?.plrAccountId) score += 120;
    if (key === "teamLead" && person.accountId && person.accountId === scope.team?.managerAccountId) score += 120;
    if (!isDefaultLeadershipAccount(person.accountId)) score += 50;
    if (!person.accountId) score += 20;
    if (looksLikeRoleTitleName(person.name)) score -= 30;
    if (/Created from Leadership & Access account/i.test(String(person.notes || ""))) score -= 10;
    if (account && !isDefaultLeadershipAccount(account.id)) score += 20;
    return { person, score };
  }).sort((a, b) => b.score - a.score);
  return new Set(scored.slice(1).map((item) => item.person.id));
}

function stateAccountById(targetState, accountId) {
  return targetState.accounts.find((account) => account.id === accountId) || null;
}

function cleanLeadershipPeoplePlacement(targetState) {
  const hrTeamId = ensurePeopleOperationsTeam(targetState);
  targetState.people = targetState.people
    .filter((person) => leadershipRoleKey(person) !== "researchDirector")
    .map((person) => isPeopleOpsRole(person) ? { ...person, teamId: hrTeamId } : person);

  const removeIds = new Set();
  targetState.org.units.forEach((unit) => {
    const unitPeople = targetState.people.filter((person) => unit.teams.some((team) => team.id === person.teamId));
    keepBestLeadershipPerson(
      unitPeople.filter((person) => leadershipRoleKey(person) === "unitDirector"),
      { targetState, unit },
      "unitDirector",
    ).forEach((id) => removeIds.add(id));
    keepBestLeadershipPerson(
      unitPeople.filter((person) => leadershipRoleKey(person) === "plr"),
      { targetState, unit },
      "plr",
    ).forEach((id) => removeIds.add(id));
    unit.teams.forEach((team) => {
      keepBestLeadershipPerson(
        targetState.people.filter((person) => person.teamId === team.id && leadershipRoleKey(person) === "teamLead"),
        { targetState, team },
        "teamLead",
      ).forEach((id) => removeIds.add(id));
    });
  });
  if (removeIds.size) {
    targetState.people = targetState.people.filter((person) => !removeIds.has(person.id));
    targetState.talentActions = (targetState.talentActions || []).filter((action) => !removeIds.has(action.personId));
  }
}

function ensureOwnerAccount(next) {
  if (next.accounts.some((account) => account.role === "owner")) return;
  next.accounts.unshift({
    id: "owner-recovery",
    name: "System Owner",
    email: "owner@example.com",
    password: "owner123",
    role: "owner",
    scopeType: "center",
    scopeId: "center-1",
  });
}

function repairHrbpTeamCoverage(next) {
  const teamIds = new Set(allTeams(next.org).map((team) => team.id));
  const unitIds = new Set(next.org.units.map((unit) => unit.id));
  next.accounts = next.accounts.map((account) => {
    if (account.role !== "hrbp") return account;
    let scopeIds = Array.isArray(account.scopeIds) ? account.scopeIds : [];
    const converted = new Set();
    scopeIds.forEach((id) => {
      if (teamIds.has(id)) converted.add(id);
      if (unitIds.has(id)) {
        allTeams(next.org).filter((team) => team.unitId === id).forEach((team) => converted.add(team.id));
      }
    });
    if (!converted.size) {
      next.people
        .filter((person) => person.hrbpId === account.id)
        .forEach((person) => {
          if (teamIds.has(person.teamId)) converted.add(person.teamId);
        });
    }
    return { ...account, scopeType: "team", scopeId: "teams", scopeIds: [...converted] };
  });
}

function repairOrganizationState(next) {
  next.org = next.org || structuredClone(defaultState.org);
  next.org.center = { ...structuredClone(defaultState.org.center), ...(next.org.center || {}) };
  const existingUnits = Array.isArray(next.org.units) ? next.org.units : [];
  next.org.units = existingUnits.map((unit) => {
    const type = ["lab", "platform", "researchTeam"].includes(unit.type) ? unit.type : "lab";
    const name = unit.name || (type === "platform" ? "Platform" : type === "researchTeam" ? "Research Team" : "Lab");
    const teams = Array.isArray(unit.teams)
      ? unit.teams.map((team) => ({
        ...team,
        id: team.id || `team-${crypto.randomUUID()}`,
        name: team.name || name || "Team",
        managerAccountId: team.managerAccountId || "",
        primary: Boolean(team.primary),
      }))
      : [];
    return {
      ...unit,
      id: unit.id || `unit-${crypto.randomUUID()}`,
      type,
      name,
      sponsor: unit.sponsor || "",
      directorAccountId: unit.directorAccountId || "",
      plrAccountId: type === "platform" || type === "researchTeam" ? "" : unit.plrAccountId || "",
      teams: type === "researchTeam" && !teams.length
        ? [{ id: `team-${crypto.randomUUID()}`, name, managerAccountId: "", primary: true }]
        : teams,
    };
  });

  const validTeamIds = new Set(allTeams(next.org).map((team) => team.id));
  const fallbackTeamId = allTeams(next.org)[0]?.id || "";
  next.people = next.people.map((person) => validTeamIds.has(person.teamId) || !fallbackTeamId ? person : { ...person, teamId: fallbackTeamId });
  next.selectedOverviewTeamId = validTeamIds.has(next.selectedOverviewTeamId) ? next.selectedOverviewTeamId : fallbackTeamId;
  const validUnitIds = new Set(next.org.units.map((unit) => unit.id));
  next.selectedUnitId = next.selectedUnitId === "all" || validUnitIds.has(next.selectedUnitId) ? next.selectedUnitId : "all";
  next.selectedTeamId = next.selectedTeamId === "all" || validTeamIds.has(next.selectedTeamId) ? next.selectedTeamId : "all";
  next.selectedTalentUnitId = next.selectedTalentUnitId === "all" || validUnitIds.has(next.selectedTalentUnitId) ? next.selectedTalentUnitId : "all";
  next.selectedTalentTeamId = next.selectedTalentTeamId === "all" || validTeamIds.has(next.selectedTalentTeamId) ? next.selectedTalentTeamId : "all";
  next.customOrgCleanupDone = true;
  pruneDeletedOrgReferences(next);
}

function pruneDeletedOrgReferences(next = state) {
  const validUnitIds = new Set(next.org.units.map((unit) => unit.id));
  const validTeamIds = new Set(allTeams(next.org).map((team) => team.id));
  next.accounts = next.accounts.map((account) => {
    if (account.role === "hrbp") {
      return { ...account, scopeIds: accountScopeIdsForState(next, account).filter((id) => validTeamIds.has(id)) };
    }
    if (account.scopeType === "unit" && !validUnitIds.has(account.scopeId)) return { ...account, scopeId: "" };
    if (account.scopeType === "team" && account.scopeId !== "teams" && !validTeamIds.has(account.scopeId)) return { ...account, scopeId: "" };
    return account;
  });
  next.orgGoals = (next.orgGoals || []).filter((goal) => isValidOrgScope(goal.scope, validUnitIds, validTeamIds));
  next.cultureActivities = (next.cultureActivities || []).filter((activity) => isValidOrgScope(activity.scope, validUnitIds, validTeamIds));
}

function accountScopeIdsForState(targetState, account) {
  if (!account) return [];
  if (account.role === "hrbp") return Array.isArray(account.scopeIds) ? account.scopeIds : [];
  return Array.isArray(account.scopeIds) && account.scopeIds.length ? account.scopeIds : account.scopeId ? [account.scopeId] : [];
}

function isValidOrgScope(scope, validUnitIds, validTeamIds) {
  const [type, id] = String(scope || "").split(":");
  if (type === "unit") return validUnitIds.has(id);
  if (type === "team") return validTeamIds.has(id);
  return false;
}

function ensureDemoHrbp(next) {
  let hrbp = next.accounts.find((account) => account.role === "hrbp");
  if (!hrbp) {
    hrbp = {
    id: "hrbp-demo",
    name: "HRBP",
    email: "hrbp@example.com",
    password: "hrbp123",
    role: "hrbp",
    scopeType: "unit",
    scopeId: "people",
    scopeIds: [],
    };
    next.accounts.push(hrbp);
  }
  if (hrbp.name === "HRBP Partner") hrbp.name = "HRBP";
  if (!next.people.some((person) => person.hrbpId === hrbp.id)) {
    hrbp.scopeIds = hrbp.scopeIds?.length ? hrbp.scopeIds : allTeams(next.org).slice(0, 2).map((team) => team.id);
  }
}

function slugify(value) {
  return String(value || "item")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `item-${crypto.randomUUID()}`;
}

function expandPeopleToTarget(existingPeople, target, org) {
  const people = [...existingPeople];
  const teams = allTeams(org);
  const roles = ["Research Engineer", "Data Scientist", "Software Engineer", "Product Manager", "QA Specialist", "UX Researcher", "Project Manager", "Hardware Engineer"];
  const contracts = CONTRACT_TYPES;
  const firstNames = ["Anna", "Lukas", "Sofia", "Marco", "Emma", "Louis", "Clara", "Hugo", "Elena", "Javier", "Zhang", "Li", "Wang", "Chen"];
  const lastNames = ["Müller", "Schneider", "Rossi", "Bianchi", "Dubois", "Martin", "García", "López", "Janssen", "Kowalski", "Wei", "Na", "Fang", "Jie"];
  const usedEmployeeNos = new Set(people.map((person) => String(person.employeeNo || "")));

  for (let index = people.length; index < target; index += 1) {
    const team = teams[index % teams.length];
    const contractType = contracts[index % contracts.length];
    people.push({
      id: `p-generated-${crypto.randomUUID()}`,
      employeeNo: nextFormattedEmployeeNo(contractType, usedEmployeeNos, index),
      name: `${firstNames[index % firstNames.length]} ${lastNames[index % lastNames.length]}`,
      teamId: team.id,
      role: roles[index % roles.length],
      level: String(13 + (index % 10)),
      contractType,
      startDate: `${2020 + (index % 7)}-${String(1 + (index % 12)).padStart(2, "0")}-15`,
      notes: "",
      talentTags: [],
      awards: [],
      growth: [],
      records: [],
    });
  }
  return people;
}

function distributeCount(total, items) {
  if (!items.length) return new Map();
  const base = Math.floor(total / items.length);
  const remainder = total % items.length;
  return new Map(items.map((item, index) => [item.id, base + (index < remainder ? 1 : 0)]));
}

function teamRolePool(team) {
  const label = `${team.unitName || ""} ${team.name || ""}`.toLowerCase();
  if (label.includes("wireless") || label.includes("rf") || label.includes("connectivity")) return ["Wireless Researcher", "RF Systems Engineer", "Connectivity Engineer", "Telecommunications Researcher"];
  if (label.includes("network security")) return ["Network Security Engineer", "Security Researcher", "Cybersecurity Specialist", "Secure Network Architect"];
  if (label.includes("network") || label.includes("cloud network")) return ["Network Researcher", "Network Engineer", "Network Architect", "Cloud Network Engineer"];
  if (label.includes("it team") || /\bit\b/.test(label)) return ["IT Systems Engineer", "IT Support Specialist", "Infrastructure Engineer", "Workplace Technology Specialist"];
  if (label.includes("algorithm") || label.includes("ai")) return ["AI Researcher", "Machine Learning Engineer", "Algorithm Researcher", "Applied Scientist"];
  if (label.includes("data")) return ["Data Engineer", "Data Scientist", "Analytics Engineer", "Data Platform Engineer"];
  if (label.includes("software")) return ["Software Engineer", "Backend Engineer", "Frontend Engineer", "Full Stack Engineer"];
  if (label.includes("product")) return ["Product Researcher", "Product Engineer", "Technical Product Specialist", "Product Innovation Specialist"];
  if (label.includes("hardware")) return ["Hardware Engineer", "Systems Engineer", "Embedded Systems Engineer", "Lab Instrumentation Engineer"];
  if (label.includes("quality") || label.includes("compliance")) return ["Quality Engineer", "Compliance Specialist", "Validation Engineer", "Regulatory Specialist"];
  if (label.includes("user")) return ["User Researcher", "UX Researcher", "Human Factors Researcher", "Research Operations Specialist"];
  if (label.includes("operation") || label.includes("support")) return ["Operations Specialist", "Research Operations Specialist", "Platform Operations Engineer", "Service Delivery Specialist"];
  if (label.includes("strategy") || label.includes("project")) return ["Strategic Projects Specialist", "Program Manager", "Portfolio Analyst", "Research Program Specialist"];
  if (label.includes("hr") || label.includes("people")) return ["HR Specialist", "Senior Recruiting Partner", "People Operations Specialist", "HRBP"];
  if (label.includes("bayer") || label.includes("bio")) return ["Bio Researcher", "Computational Biology Researcher", "Lab Automation Engineer", "Research Scientist"];
  return ["Researcher", "Research Engineer", "Technical Specialist", "Project Engineer"];
}

function demoPersonName(index) {
  const names = [
    "Anna Mueller", "Lukas Schneider", "Sofia Romano", "Marco Bianchi", "Emma Dubois", "Louis Martin", "Clara Fischer", "Hugo Bernard",
    "Elena Garcia", "Javier Morales", "Marta Kowalska", "Pieter Janssen", "Ines Dubois", "Oskar Andersen", "Camille Laurent", "Nina Rossi",
    "Wei Zhang", "Bo Wang", "Ming Huang", "Jie Chen", "Yun Li", "Na Zhao", "Fang Liu", "Tao Sun", "Priya Nair", "Amit Sharma",
    "Sara Lindholm", "Noah Weber", "Laura Rossi", "Daniel Novak", "Katarina Horvat", "Mateo Costa",
  ];
  return `${names[index % names.length]} ${Math.floor(index / names.length) + 1}`;
}

function rebalanceDemoStaffing(targetState) {
  const version = "demo-200-wireless-network-it-v1";
  if (targetState.staffingPlanVersion === version) return;
  const hrTeamId = ensurePeopleOperationsTeam(targetState);
  ensureResearchOrgForDemo(targetState);
  targetState.org.units = targetState.org.units.map((unit) => {
    if (!/von neumann|bayer/i.test(unit.name || "") || unit.teams.length) return unit;
    return {
      ...unit,
      teams: [{
        id: `team-${slugify(unit.name)}-research`,
        name: /bayer/i.test(unit.name || "") ? "Bayer Research Team" : "Research Team",
        managerAccountId: "",
        primary: true,
      }],
    };
  });
  const teams = allTeams(targetState.org);
  const vonTeams = teams.filter((team) => /von neumann/i.test(team.unitName || ""));
  const bayerTeams = teams.filter((team) => /bayer/i.test(team.unitName || ""));
  const primaryLabTeams = vonTeams.length ? vonTeams : teams.filter((team) => team.unitType === "lab").slice(0, 3);
  const secondaryLabTeams = bayerTeams.length ? bayerTeams : teams.filter((team) => team.unitType === "lab" && !primaryLabTeams.some((item) => item.id === team.id)).slice(0, 2);
  const allocatedIds = new Set([...primaryLabTeams, ...secondaryLabTeams].map((team) => team.id));
  const remainingTeams = teams.filter((team) => !allocatedIds.has(team.id));
  const plan = new Map([
    ...distributeCount(80, primaryLabTeams),
    ...distributeCount(30, secondaryLabTeams),
    ...distributeCount(90, remainingTeams),
  ]);
  if (!plan.size) return;

  const accountPeople = targetState.people.filter((person) => person.accountId);
  const usedEmployeeNos = new Set(accountPeople.map((person) => String(person.employeeNo || "")));
  const generated = [];
  let serial = 0;
  teams.forEach((team) => {
    const targetCount = plan.get(team.id) || 0;
    const existingAccounts = accountPeople.filter((person) => person.teamId === team.id).length;
    const needed = Math.max(0, targetCount - existingAccounts);
    const roles = teamRolePool(team);
    for (let index = 0; index < needed; index += 1) {
      const contractType = CONTRACT_TYPES[(serial + index) % CONTRACT_TYPES.length];
      generated.push({
        id: `p-demo-${team.id}-${index}`,
        employeeNo: nextFormattedEmployeeNo(contractType, usedEmployeeNos, serial + index),
        name: demoPersonName(serial + index),
        teamId: team.id,
        role: roles[index % roles.length],
        level: String(13 + ((serial + index) % 6)),
        contractType,
        startDate: `${2019 + ((serial + index) % 7)}-${String(1 + ((serial + index) % 12)).padStart(2, "0")}-15`,
        notes: "",
        talentTags: [],
        awards: [],
        growth: [],
        records: [],
      });
    }
    serial += needed;
  });

  targetState.people = [...accountPeople, ...generated].slice(0, 200);
  targetState.staffingPlanVersion = version;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  queueRemoteSave();
}

function sharedStatePayload() {
  return {
    ...state,
    sessionAccountId: "",
    searchText: "",
    selectedUnitId: "all",
    selectedTeamId: "all",
    selectedTalentUnitId: "all",
    selectedTalentTeamId: "all",
    activePage: "overviewPage",
    peopleDisplayLimit: 24,
    ownerViewScope: { type: "center", id: "center-1" },
  };
}

async function loadRemoteState() {
  if (!supabaseClient) return false;
  const sessionAccountId = state.sessionAccountId;
  const language = state.language;
  const localSnapshot = structuredClone(state);
  const { data, error } = await supabaseClient
    .from("app_state")
    .select("data")
    .eq("id", SUPABASE_STATE_ID)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  const remoteData = data?.data && typeof data.data === "object" ? data.data : {};
  remoteStateWasEmpty = !Object.keys(remoteData).length;
  state = normalizeState({
    ...(remoteStateWasEmpty ? localSnapshot : remoteData),
    sessionAccountId,
    language,
  });
  remoteStateLoaded = true;
  suppressRemoteSave = true;
  saveState();
  suppressRemoteSave = false;
  return true;
}

async function saveRemoteStateNow() {
  if (!supabaseClient || !remoteStateLoaded || suppressRemoteSave || isSavingRemote || !remoteAuthMatchesCurrentAccount()) return;
  isSavingRemote = true;
  const { error } = await supabaseClient
    .from("app_state")
    .update({
      data: sharedStatePayload(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", SUPABASE_STATE_ID);
  isSavingRemote = false;
  if (error) {
    console.error(error);
    showToast(t("remoteSaveFailed"));
  }
}

function queueRemoteSave() {
  if (!supabaseClient || !remoteStateLoaded || suppressRemoteSave || !remoteAuthMatchesCurrentAccount()) return;
  clearTimeout(remoteSaveTimer);
  remoteSaveTimer = setTimeout(() => {
    saveRemoteStateNow();
  }, 350);
}

function t(key, params = {}) {
  const text = translations[state.language]?.[key] || translations.zh[key] || key;
  return Object.entries(params).reduce((result, [name, value]) => result.replaceAll(`{${name}}`, value), text);
}

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function normalizeContractType(value) {
  return {
    "正式员工": "Employee",
    "外包": "Leased Labour",
    "实习生": "Intern",
    "顾问": "Leased Labour",
  }[value] || (CONTRACT_TYPES.includes(value) ? value : "Employee");
}

function confirmAction(action) {
  return window.confirm(t("confirmChange", { action }));
}

function showValidation(messageKey) {
  alert(t(messageKey));
}

let toastTimer = 0;

function showToast(message) {
  if (!elements.toast) return;
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  toastTimer = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2600);
}

function withTimeout(promise, ms = 12000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), ms);
    }),
  ]);
}

function currentAccount() {
  return state.accounts.find((account) => account.id === state.sessionAccountId) || null;
}

function accountByEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  return state.accounts.find((account) => account.email.toLowerCase() === normalized) || null;
}

function isDemoOnlyAccountState() {
  const demoEmails = new Set(defaultState.accounts.map((account) => account.email.toLowerCase()));
  return state.accounts.length > 0 && state.accounts.every((account) => demoEmails.has(account.email.toLowerCase()));
}

function remoteAuthMatchesCurrentAccount() {
  const account = currentAccount();
  return Boolean(remoteAuthEmail && account && account.email.toLowerCase() === remoteAuthEmail);
}

async function clearRemoteAuth() {
  remoteAuthEmail = "";
  remoteStateLoaded = false;
  if (supabaseClient) await supabaseClient.auth.signOut();
}

function createInitialOwnerAccount(email, name = "") {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized || accountByEmail(normalized) || (!remoteStateWasEmpty && !isDemoOnlyAccountState())) return null;
  const account = {
    id: `owner-${crypto.randomUUID()}`,
    name: name || normalized.split("@")[0] || "System Owner",
    email: normalized,
    password: "",
    role: "owner",
    scopeType: "center",
    scopeId: "center-1",
  };
  state.accounts = [account, ...state.accounts];
  return account;
}

function localPasswordAccount(email, password) {
  const normalized = String(email || "").trim().toLowerCase();
  const existing = state.accounts.find((item) => item.email.toLowerCase() === normalized && item.password === password);
  if (existing) return existing;
  const demoAccount = defaultState.accounts.find((item) => item.email.toLowerCase() === normalized && item.password === password);
  if (!demoAccount) return null;
  const restoredAccount = structuredClone(demoAccount);
  state.accounts = [
    restoredAccount,
    ...state.accounts.filter((item) => item.email.toLowerCase() !== normalized && item.id !== restoredAccount.id),
  ];
  return restoredAccount;
}

function completeLogin(account) {
  state.sessionAccountId = account.id;
  state.searchText = "";
  state.selectedUnitId = "all";
  state.selectedTeamId = "all";
  state.selectedTalentUnitId = "all";
  state.selectedTalentTeamId = "all";
  elements.loginForm.reset();
  elements.loginError.textContent = "";
  saveAndRender();
}

function isOwner() {
  return currentAccount()?.role === "owner";
}

function isGlobalViewer() {
  return ["owner", "researchDirector"].includes(currentAccount()?.role);
}

function allTeams(org = state.org) {
  return org.units.flatMap((unit) => unit.teams.map((team) => ({ ...team, unitId: unit.id, unitName: unit.name, unitType: unit.type })));
}

function teamExists(teamId, org = state.org) {
  return allTeams(org).some((team) => team.id === teamId);
}

function teamById(teamId) {
  return allTeams().find((team) => team.id === teamId);
}

function unitByTeam(teamId) {
  const team = teamById(teamId);
  return state.org.units.find((unit) => unit.id === team?.unitId);
}

function unitTypeLabel(type) {
  if (type === "platform") return t("platformUnit");
  if (type === "researchTeam") return t("independentResearchTeam");
  return t("researchLab");
}

function unitDisplayName(unit) {
  if (!unit) return "";
  return unit.name;
}

function teamDisplayName(team) {
  if (!team) return "";
  return team.unitType === "researchTeam" ? team.unitName : `${team.unitName} / ${team.name}`;
}

function canAddChildTeam(unit) {
  return unit?.type !== "researchTeam";
}

function accountName(accountId) {
  return state.accounts.find((account) => account.id === accountId)?.name || t("noManager");
}

function accountScopeIds(account) {
  if (!account) return [];
  if (account.role === "hrbp") return Array.isArray(account.scopeIds) ? account.scopeIds : [];
  return Array.isArray(account.scopeIds) && account.scopeIds.length ? account.scopeIds : account.scopeId ? [account.scopeId] : [];
}

function hrbpPersonIds(accountId) {
  const account = state.accounts.find((item) => item.id === accountId);
  const teamIds = new Set(accountScopeIds(account));
  return state.people.filter((person) => teamIds.has(person.teamId)).map((person) => person.id);
}

function hrbpTeamIds(accountId) {
  const account = state.accounts.find((item) => item.id === accountId);
  return accountScopeIds(account).filter((id) => teamById(id));
}

function visibleTeams() {
  const account = currentAccount();
  if (!account) return [];
  if (account.role === "owner") {
    const scope = state.ownerViewScope || { type: "center", id: "center-1" };
    if (scope.type === "center") return allTeams();
    if (scope.type === "unit") return allTeams().filter((team) => team.unitId === scope.id);
    if (scope.type === "team") return allTeams().filter((team) => team.id === scope.id);
    return allTeams();
  }
  if (isGlobalViewer()) return allTeams();
  if (account.role === "hrbp") {
    const teamIds = new Set(hrbpTeamIds(account.id));
    return allTeams().filter((team) => teamIds.has(team.id));
  }
  if (["labDirector", "plr", "platformLead"].includes(account.role)) {
    return allTeams().filter((team) => team.unitId === account.scopeId);
  }
  if (account.role === "teamManager") return allTeams().filter((team) => team.id === account.scopeId);
  return [];
}

function visiblePeople() {
  const account = currentAccount();
  const teamIds = new Set(visibleTeams().map((team) => team.id));
  return state.people.filter((person) => teamIds.has(person.teamId));
}

function canViewPerson(person) {
  if (!person) return false;
  return visibleTeams().some((team) => team.id === person.teamId);
}

function canAddDeleteEmployees() {
  return isOwner();
}

function canAddRecord(person) {
  return canAddManagerRecord(person) || canEditTalentProfile(person);
}

function canAddManagerRecord(person) {
  const account = currentAccount();
  if (!account) return false;
  if (isGlobalViewer()) return true;
  const unit = unitByTeam(person.teamId);
  if (["labDirector", "plr", "platformLead"].includes(account.role)) return account.scopeId === unit?.id;
  return account.role === "teamManager" && account.scopeId === person.teamId;
}

function canEditTalentProfile(person) {
  const account = currentAccount();
  if (!account) return false;
  if (isOwner()) return true;
  return account.role === "hrbp" && hrbpTeamIds(account.id).includes(person.teamId);
}

function canAddTalentInsight(person) {
  return canEditTalentProfile(person);
}

function canAddTalentActionForPerson(person) {
  return canEditTalentProfile(person);
}

function canEditTalentOrg() {
  const role = currentAccount()?.role;
  return role === "owner" || role === "hrbp";
}

function openTalentActionsForPerson(personId) {
  return state.talentActions.filter((action) => action.personId === personId && !action.archived && action.status !== "Done");
}

function filteredPeople() {
  const query = state.searchText.trim().toLowerCase();
  return visiblePeople().filter((person) => {
    const team = teamById(person.teamId);
    const unit = unitByTeam(person.teamId);
    const inUnit = state.selectedUnitId === "all" || unit?.id === state.selectedUnitId;
    const inTeam = state.selectedTeamId === "all" || person.teamId === state.selectedTeamId;
    const text = [person.employeeNo, person.name, person.role, person.level, person.contractType, ...(person.talentTags || []), team?.name, unit?.name].join(" ").toLowerCase();
    return inUnit && inTeam && (!query || text.includes(query));
  });
}

function applyI18n() {
  document.documentElement.lang = state.language === "en" ? "en" : "zh-CN";
  document.title = state.language === "en" ? "Talent Management System" : "人才管理系统";
  document.querySelectorAll("[data-i18n]").forEach((node) => (node.textContent = t(node.dataset.i18n)));
  document.querySelectorAll("[data-placeholder-i18n]").forEach((node) => (node.placeholder = t(node.dataset.placeholderI18n)));
  elements.demoLoginHint.innerHTML = loginHintHtml();
}

function loginHintHtml() {
  if (supabaseClient) return escapeHtml(t("demoHint"));
  const roleOrder = ["owner", "researchDirector", "labDirector", "teamManager", "hrbp"];
  const samples = roleOrder
    .map((role) => state.accounts.find((account) => account.role === role))
    .filter(Boolean)
    .filter((account, index, list) => list.findIndex((item) => item.id === account.id) === index)
    .slice(0, 4);
  if (!samples.length) return escapeHtml(t("demoHint"));
  const prefix = state.language === "en" ? "Available logins. Use one pair at a time:" : "当前可用登录。每次使用一组邮箱和密码：";
  return `<span>${escapeHtml(prefix)}</span><span class="login-hint-list">${samples.map((account) => `<code>${escapeHtml(account.email)} / ${escapeHtml(account.password)}</code>`).join("")}</span>`;
}

function render() {
  applyI18n();
  const account = currentAccount();
  const loggedIn = Boolean(account);
  elements.loginView.classList.toggle("is-hidden", loggedIn);
  document.querySelector(".app-shell").classList.toggle("is-hidden", !loggedIn);
  elements.loginLanguageSwitcher.value = state.language;
  elements.languageSwitcher.value = state.language;
  if (!loggedIn) return;
  normalizeAccessState();
  renderActivePage();

  elements.instituteName.value = state.org.center.name;
  elements.instituteName.disabled = !isOwner();
  elements.signedInName.textContent = account.name;
  elements.signedInMeta.innerHTML = `<span>${escapeHtml(roleLabel(account.role))} · ${escapeHtml(accountScopeSummary(account))}</span><span>${escapeHtml(account.email)}</span>`;
  elements.pageTitle.textContent = state.org.center.name;
  elements.pageSubtitle.textContent = `${accountScopeSummary(account)} · ${visiblePeople().length} ${t("peopleUnit")}`;
  elements.searchInput.value = state.searchText;

  applyVisibilityRules();
  elements.showAddPersonBtn.classList.toggle("is-hidden", !canAddDeleteEmployees());
  elements.showDeletePersonBtn.classList.toggle("is-hidden", !canAddDeleteEmployees());
  elements.permissionHint.textContent = permissionText(account.role);

  renderAccountAdmin();
  renderOrgAdmin();
  renderTalentSettings();
  renderDevelopmentSettings();
  renderTalentDevelopment();
  renderTeamFilter();
  renderOrgChart();
  renderOverviewRoster();
  renderSummary();
  renderPeople();
  renderPeopleStatistics();
  renderBulkArchivePeopleList();
  renderFormerEmployeeArchive();
  refreshFormOptions();
  applyVisibilityRules();
}

function normalizeAccessState() {
  const account = currentAccount();
  if (!account) return;
  const teams = visibleTeams();
  const teamIds = new Set(teams.map((team) => team.id));
  const units = visibleUnits();
  const unitIds = new Set(units.map((unit) => unit.id));

  if (state.selectedUnitId !== "all" && !unitIds.has(state.selectedUnitId)) state.selectedUnitId = "all";
  if (state.selectedTeamId !== "all" && !teamIds.has(state.selectedTeamId)) state.selectedTeamId = "all";
  if (state.selectedTalentUnitId !== "all" && !unitIds.has(state.selectedTalentUnitId)) state.selectedTalentUnitId = "all";
  if (state.selectedTalentTeamId !== "all" && !teamIds.has(state.selectedTalentTeamId)) state.selectedTalentTeamId = "all";
  if (!teamIds.has(state.selectedOverviewTeamId)) state.selectedOverviewTeamId = teams[0]?.id || "all";
}

function applyVisibilityRules() {
  document.querySelectorAll(".owner-only").forEach((node) => node.classList.toggle("is-hidden", !isOwner()));
  document.querySelectorAll(".owner-hrbp-write").forEach((node) => node.classList.toggle("is-hidden", !canEditTalentOrg()));
}

function renderActivePage() {
  const knownPages = [...elements.pagePanels].map((panel) => panel.id);
  const requestedPage = knownPages.includes(state.activePage) ? state.activePage : "overviewPage";
  const activePage = requestedPage;
  state.activePage = activePage;
  elements.pageTabs.forEach((tab) => {
    const isActive = tab.dataset.pageTarget === activePage;
    tab.classList.toggle("active", isActive);
  });
  elements.pagePanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === activePage);
  });
}

function roleLabel(role) {
  return {
    owner: "Owner",
    researchDirector: "Research Center Director",
    labDirector: "Lab Director",
    plr: "PLR",
    platformLead: "Platform Lead",
    hrbp: "HRBP",
    teamManager: "Team Lead",
  }[role] || role;
}

function permissionText(role) {
  if (role === "owner") return t("ownerPermission");
  if (role === "researchDirector") return t("directorPermission");
  if (role === "hrbp") return state.language === "en" ? "HRBP can view assigned Teams and add talent-management records." : "HRBP 可查看被授权的 Team，并添加人才管理记录。";
  if (["labDirector", "plr", "platformLead"].includes(role)) return t("labPermission");
  return t("teamPermission");
}

function accountScopeSummary(account) {
  if (!account) return "";
  if (account.role === "owner" || account.role === "researchDirector") return state.org.center.name;
  if (account.role === "hrbp") return `${hrbpTeamIds(account.id).length} Teams`;
  return scopeLabel(account);
}

function renderAccountAdmin() {
  if (!isOwner()) {
    elements.businessAccountForm.innerHTML = "";
    elements.hrbpAccountForm.innerHTML = "";
    elements.accountList.innerHTML = "";
    elements.hrbpAssignmentList.innerHTML = "";
    return;
  }
  const globalAccounts = state.accounts.filter((account) => ["owner", "researchDirector"].includes(account.role));
  const accountGroups = [
    { id: "global", title: state.org.center.name, accounts: globalAccounts },
    ...state.org.units.map((unit) => ({
      id: unit.id,
      title: unitDisplayName(unit),
      accounts: state.accounts.filter((account) =>
        account.role !== "hrbp" && (
        account.scopeId === unit.id ||
        unit.teams.some((team) => account.scopeId === team.id)
        ),
      ),
    })),
  ];
  elements.businessAccountForm.innerHTML = renderNewAccountForm("business");
  elements.hrbpAccountForm.innerHTML = renderNewAccountForm("hrbp");
  elements.accountList.innerHTML = accountGroups
    .map((group) => `<details class="account-group">
      <summary><span>${escapeHtml(group.title)}</span><small>${group.accounts.length} accounts</small></summary>
      <div class="account-group-body">
        ${group.accounts.map(renderAccountRow).join("") || `<div class="empty-state">${t("noMatchedPeople")}</div>`}
      </div>
    </details>`)
    .join("");
  renderHrbpAssignments();
  bindAccountEditors(elements.accountList);
  bindAccountEditors(elements.hrbpAssignmentList);
  bindNewAccountForms();
  elements.newAccountRole.innerHTML = [
    ["researchDirector", "Research Center Director"],
    ["labDirector", "Lab Director"],
    ["plr", "PLR"],
    ["platformLead", "Platform Lead"],
    ["hrbp", "HRBP"],
    ["teamManager", "Team Lead"],
  ].map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
  renderScopeOptions();
}

function renderNewAccountForm(kind) {
  const isHrbpForm = kind === "hrbp";
  const title = isHrbpForm
    ? (state.language === "en" ? "Add HRBP Account" : "新增 HRBP 账号")
    : (state.language === "en" ? "Add Business Leadership Account" : "新增业务主管账号");
  const roleSelect = isHrbpForm
    ? `<input data-new-account-role="${kind}" type="hidden" value="hrbp" /><div class="readonly-field"><span>${t("permissionRole")}</span><strong>HRBP</strong></div>`
    : `<label><span>${t("permissionRole")}</span><select data-new-account-role="${kind}">${businessRoleOptions()}</select></label>`;
  return `<details class="account-group account-create">
    <summary><span>${escapeHtml(title)}</span></summary>
    <div class="account-form account-form-wide" data-new-account-form="${kind}">
      <label><span>${t("accountName")}</span><input data-new-account-name="${kind}" type="text" /></label>
      <label><span>${t("email")}</span><input data-new-account-email="${kind}" type="email" /></label>
      <label><span>${t("temporaryPassword")}</span><input data-new-account-password="${kind}" type="text" /></label>
      ${roleSelect}
      <label><span>${t("scope")}</span><select data-new-account-scope="${kind}" ${isHrbpForm ? "multiple size=\"8\"" : ""}>${newAccountScopeOptions(isHrbpForm ? "hrbp" : "researchDirector")}</select>${isHrbpForm ? `<small class="hint">${state.language === "en" ? "Select one or more Teams, then confirm." : "可选择一个或多个 Team，然后确认创建。"}</small>` : ""}</label>
      <button type="button" class="primary" data-add-account-kind="${kind}">${t("addAccount")}</button>
    </div>
  </details>`;
}

function businessRoleOptions(selectedRole = "researchDirector") {
  return [
    ["researchDirector", "Research Center Director"],
    ["labDirector", "Lab Director"],
    ["plr", "PLR"],
    ["platformLead", "Platform Lead"],
    ["teamManager", "Team Lead"],
  ].map(([value, label]) => `<option value="${value}" ${value === selectedRole ? "selected" : ""}>${label}</option>`).join("");
}

function newAccountScopeOptions(role, selectedScope = "") {
  if (role === "researchDirector") {
    return `<option value="center-1" ${selectedScope === "center-1" ? "selected" : ""}>${escapeHtml(state.org.center.name)}</option>`;
  }
  if (role === "hrbp") {
    return allTeams().map((team) => `<option value="${team.id}" ${isSelectedScope(selectedScope, team.id) ? "selected" : ""}>${escapeHtml(teamDisplayName(team))}</option>`).join("");
  }
  if (["labDirector", "plr"].includes(role)) {
    return state.org.units
      .filter((unit) => unit.type === "lab")
      .map((unit) => `<option value="${unit.id}" ${isSelectedScope(selectedScope, unit.id) ? "selected" : ""}>${escapeHtml(unitDisplayName(unit))}</option>`)
      .join("");
  }
  if (role === "platformLead") {
    return state.org.units
      .filter((unit) => unit.type === "platform")
      .map((unit) => `<option value="${unit.id}" ${isSelectedScope(selectedScope, unit.id) ? "selected" : ""}>${escapeHtml(unitDisplayName(unit))}</option>`)
      .join("");
  }
  return allTeams().map((team) => `<option value="${team.id}" ${isSelectedScope(selectedScope, team.id) ? "selected" : ""}>${escapeHtml(teamDisplayName(team))}</option>`).join("");
}

function bindNewAccountForms() {
  [elements.businessAccountForm, elements.hrbpAccountForm].forEach((root) => {
    root.querySelectorAll("[data-new-account-role]").forEach((control) => {
      control.addEventListener("change", () => {
        const kind = control.dataset.newAccountRole;
        const scopeSelect = root.querySelector(`[data-new-account-scope="${kind}"]`);
        if (!scopeSelect) return;
        scopeSelect.innerHTML = newAccountScopeOptions(control.value, "");
        scopeSelect.multiple = control.value === "hrbp";
        scopeSelect.size = control.value === "hrbp" ? 8 : 1;
      });
    });
    root.querySelectorAll("[data-add-account-kind]").forEach((button) => {
      button.addEventListener("click", () => addAccountFromPanel(button.dataset.addAccountKind, root));
    });
  });
}

function bindAccountEditors(root) {
  root.querySelectorAll("[data-account-role]").forEach((select) => {
    select.addEventListener("change", () => {
      const accountId = select.dataset.accountRole;
      const row = select.closest("[data-account-row]");
      const scopeSelect = row?.querySelector(`[data-account-scope="${accountId}"]`);
      if (!scopeSelect) return;
      scopeSelect.innerHTML = scopeOptionsForRole(select.value, "");
      scopeSelect.multiple = false;
      scopeSelect.size = 1;
      markAccountDirty(row);
    });
  });
  root.querySelectorAll("[data-account-row] input, [data-account-row] select").forEach((control) => {
    const row = control.closest("[data-account-row]");
    control.addEventListener("input", () => markAccountDirty(row));
    control.addEventListener("change", () => markAccountDirty(row));
  });
  root.querySelectorAll("[data-save-account]").forEach((button) => {
    button.addEventListener("click", () => saveAccountEdit(button.dataset.saveAccount, button.closest("[data-account-row]")));
  });
  root.querySelectorAll("[data-delete-account]").forEach((button) => {
    button.addEventListener("click", () => deleteAccount(button.dataset.deleteAccount));
  });
}

function markAccountDirty(row) {
  if (!row) return;
  row.classList.add("is-dirty");
}

function renderHrbpAssignments() {
  const hrbps = state.accounts.filter((account) => account.role === "hrbp");
  elements.hrbpAssignmentList.innerHTML = hrbps.length
    ? hrbps.map((account) => `<details class="account-group">
      <summary><span>${escapeHtml(account.name)}</span><small>${hrbpTeamIds(account.id).length} Teams · ${hrbpPersonIds(account.id).length} ${t("peopleUnit")}</small></summary>
      <div class="account-group-body">
        ${renderAccountRow(account)}
        <label><span>${t("assignedTeams")}</span><select data-hrbp-teams="${account.id}" multiple size="10">${allTeams().map((team) => {
          return `<option value="${team.id}" ${hrbpTeamIds(account.id).includes(team.id) ? "selected" : ""}>${escapeHtml(teamDisplayName(team))} · ${state.people.filter((person) => person.teamId === team.id).length} ${t("peopleUnit")}</option>`;
        }).join("")}</select><small class="hint">${state.language === "en" ? "Hold Ctrl/Cmd or Shift to select multiple teams." : "可按 Ctrl/Cmd 或 Shift 多选 Team。"}</small></label>
        <button type="button" class="primary" data-save-hrbp-teams="${account.id}">${t("saveHrbpPeople")}</button>
      </div>
    </details>`).join("")
    : `<div class="empty-state">${t("noMatchedPeople")}</div>`;
  elements.hrbpAssignmentList.querySelectorAll("[data-save-hrbp-teams]").forEach((button) => {
    button.addEventListener("click", () => saveHrbpTeams(button.dataset.saveHrbpTeams));
  });
}

function renderAccountRow(account) {
  const multi = false;
  const scopeHelp = account.role === "hrbp" ? `<small class="hint">${state.language === "en" ? "Detailed HRBP team coverage is edited in the HRBP panel." : "HRBP 的 Team 覆盖范围请在右侧 HRBP 面板编辑。"}</small>` : "";
  return `<details class="account-item account-editor account-row-details" data-account-row="${account.id}">
      <summary>
        <span><strong>${escapeHtml(account.name)}</strong><small>${roleLabel(account.role)} · ${scopeLabel(account)}</small></span>
      </summary>
      <label><span>${t("accountName")}</span><input data-account-name="${account.id}" value="${escapeHtml(account.name)}" /></label>
      <label><span>${t("email")}</span><input data-account-email="${account.id}" type="email" value="${escapeHtml(account.email)}" /></label>
      <label><span>${t("password")}</span><input class="readonly-field" type="text" value="${escapeHtml(account.password)}" readonly /></label>
      <label><span>${t("permissionRole")}</span><select data-account-role="${account.id}">${roleOptions(account.role)}</select></label>
      <label><span>${t("scope")}</span><select data-account-scope="${account.id}" ${multi ? `multiple size="${Math.min(5, state.org.units.length)}"` : ""}>${scopeOptionsForRole(account.role, multi ? accountScopeIds(account) : account.scopeId)}</select>${scopeHelp}</label>
      <div class="account-actions">
        <span class="account-save-hint" data-account-save-hint="${account.id}">${t("unsavedChanges")}</span>
        <button type="button" data-save-account="${account.id}">${t("saveAccount")}</button>
        ${isOwner() ? `<button type="button" class="text-danger" data-delete-account="${account.id}">${t("deleteAccount")}</button>` : ""}
      </div>
    </details>`;
}

function roleOptions(selectedRole) {
  return [
    ["owner", "Owner"],
    ["researchDirector", "Research Center Director"],
    ["labDirector", "Lab Director"],
    ["plr", "PLR"],
    ["platformLead", "Platform Lead"],
    ["hrbp", "HRBP"],
    ["teamManager", "Team Lead"],
  ].map(([value, label]) => `<option value="${value}" ${value === selectedRole ? "selected" : ""}>${label}</option>`).join("");
}

function isSelectedScope(selectedScope, id) {
  return Array.isArray(selectedScope) ? selectedScope.includes(id) : selectedScope === id;
}

function scopeOptionsForRole(role, selectedScopeId) {
  if (role === "owner" || role === "researchDirector") {
    return `<option value="center-1" ${selectedScopeId === "center-1" ? "selected" : ""}>${escapeHtml(state.org.center.name)}</option>`;
  }
  if (role === "hrbp") {
    return `<option value="teams" selected>${t("assignedTeams")}</option>`;
  }
  if (["labDirector", "plr", "platformLead", "hrbp"].includes(role)) {
    return state.org.units
      .filter((unit) => role === "hrbp" || (role === "platformLead" ? unit.type === "platform" : unit.type === "lab"))
      .map((unit) => `<option value="${unit.id}" ${isSelectedScope(selectedScopeId, unit.id) ? "selected" : ""}>${escapeHtml(unitDisplayName(unit))}</option>`)
      .join("");
  }
  return allTeams().map((team) => `<option value="${team.id}" ${isSelectedScope(selectedScopeId, team.id) ? "selected" : ""}>${escapeHtml(teamDisplayName(team))}</option>`).join("");
}

function renderOrgAdmin() {
  if (!isOwner()) return;
  syncNewUnitNameField();
  elements.newTeamUnit.innerHTML = state.org.units
    .filter(canAddChildTeam)
    .map((unit) => `<option value="${unit.id}">${escapeHtml(unitDisplayName(unit))}</option>`)
    .join("");
  const groupedUnits = [
    ["lab", t("researchLab")],
    ["researchTeam", t("independentResearchTeam")],
    ["platform", t("platformUnit")],
  ];
  elements.orgEditList.innerHTML = groupedUnits.map(([type, label]) => {
    const units = state.org.units.filter((unit) => unit.type === type);
    return `<details class="org-edit-type-group">
      <summary><span><strong>${escapeHtml(label)}</strong><small>${units.length} ${t("businessUnits")}</small></span></summary>
      <div class="org-edit-type-body">
        ${units.map(renderOrgEditUnit).join("") || `<div class="empty-state">${t("noMatchedPeople")}</div>`}
      </div>
    </details>`;
  }).join("");
  elements.orgEditList.querySelectorAll("[data-save-unit-name]").forEach((button) => {
    button.addEventListener("click", () => renameUnit(button.dataset.saveUnitName));
  });
  elements.orgEditList.querySelectorAll("[data-save-team-name]").forEach((button) => {
    button.addEventListener("click", () => renameTeam(button.dataset.saveTeamName));
  });
  elements.orgEditList.querySelectorAll("[data-delete-settings-unit]").forEach((button) => {
    button.addEventListener("click", () => deleteUnit(button.dataset.deleteSettingsUnit));
  });
  elements.orgEditList.querySelectorAll("[data-delete-settings-team]").forEach((button) => {
    button.addEventListener("click", () => deleteTeam(button.dataset.deleteSettingsTeam));
  });
  renderMigrationTool();
}

function renderOrgEditUnit(unit) {
  const peopleCount = unit.teams.reduce((sum, team) => sum + state.people.filter((person) => person.teamId === team.id).length, 0);
  const teamRows = unit.type === "researchTeam"
    ? `<p class="hint">${t("noTeamsUnderStandalone")}</p>`
    : unit.teams.map((team) => `<div class="inline-form">
        <input data-team-name="${team.id}" value="${escapeHtml(team.name)}" />
        <button type="button" data-save-team-name="${team.id}">${t("save")}</button>
        <button type="button" class="text-danger" data-delete-settings-team="${team.id}">${t("delete")}</button>
      </div>`).join("") || `<p class="hint">${t("noMatchedPeople")}</p>`;
  return `<details class="org-edit-group">
    <summary><span>${escapeHtml(unit.name)}</span><small>${unit.teams.length} Teams · ${peopleCount} ${t("peopleUnit")}</small></summary>
    <div class="org-edit-unit-body">
      <div class="inline-form">
        <input data-unit-name="${unit.id}" value="${escapeHtml(unit.name)}" />
        <button type="button" data-save-unit-name="${unit.id}">${t("save")}</button>
        <button type="button" class="text-danger" data-delete-settings-unit="${unit.id}">${t("delete")}</button>
      </div>
      <div class="org-edit-team-list">${teamRows}</div>
    </div>
  </details>`;
}

function syncNewUnitNameField() {
  const type = elements.newUnitType.value;
  elements.newUnitName.disabled = false;
  elements.newUnitName.placeholder = type === "researchTeam" ? "例如：AI Incubation / Small Molecule Research" : "例如：Bio / AI / Product / Digital Platform";
  elements.unitNameLabel.textContent = t("unitName");
}

function renderMigrationTool() {
  const teams = allTeams();
  const options = state.org.units.map((unit) => {
    const unitTeams = teams.filter((team) => team.unitId === unit.id);
    return `<optgroup label="${escapeHtml(unitDisplayName(unit))}">${unitTeams.map((team) => `<option value="${team.id}">${escapeHtml(teamDisplayName(team))} (${state.people.filter((person) => person.teamId === team.id).length})</option>`).join("")}</optgroup>`;
  }).join("");
  const previousSource = elements.moveSourceTeam.value;
  const previousTarget = elements.moveTargetTeam.value;
  elements.moveSourceTeam.innerHTML = options;
  elements.moveTargetTeam.innerHTML = options;
  if (teams.some((team) => team.id === previousSource)) elements.moveSourceTeam.value = previousSource;
  if (teams.some((team) => team.id === previousTarget)) elements.moveTargetTeam.value = previousTarget;
  if (elements.moveSourceTeam.value === elements.moveTargetTeam.value && teams.length > 1) {
    elements.moveTargetTeam.value = teams.find((team) => team.id !== elements.moveSourceTeam.value)?.id || teams[0]?.id || "";
  }
  renderMovePeopleList();
}

function renderMovePeopleList() {
  const sourceTeamId = elements.moveSourceTeam.value;
  const people = state.people.filter((person) => person.teamId === sourceTeamId);
  elements.movePeopleList.innerHTML = people.length
    ? people.map((person) => `<label class="migration-row"><input type="checkbox" data-move-person="${person.id}" /><span><strong>${escapeHtml(person.employeeNo)}</strong> ${escapeHtml(person.name)}</span><small>${escapeHtml(person.role)} · ${escapeHtml(person.level || "")}</small></label>`).join("")
    : `<div class="empty-state">${t("noMatchedPeople")}</div>`;
}

function renderBulkArchivePeopleList() {
  if (!elements.bulkArchivePeopleList) return;
  const people = state.people
    .slice()
    .sort((a, b) => String(a.employeeNo).localeCompare(String(b.employeeNo)));
  elements.bulkArchivePeopleList.innerHTML = people.length
    ? people.map((person) => {
      const team = teamById(person.teamId);
      return `<label class="migration-row archive-row">
        <input type="checkbox" data-bulk-archive-person="${person.id}" />
        <span><strong>${escapeHtml(person.employeeNo)}</strong> ${escapeHtml(person.name)}</span>
        <small>${escapeHtml(teamDisplayName(team))} · ${escapeHtml(person.role)} · ${escapeHtml(person.level || "")}</small>
      </label>`;
    }).join("")
    : `<div class="empty-state">${t("noMatchedPeople")}</div>`;
}

function renderFormerEmployeeArchive() {
  if (!elements.formerEmployeeList) return;
  const people = (state.formerPeople || []).slice(0, 80);
  elements.formerEmployeeList.innerHTML = people.length
    ? people.map((person) => {
      const team = teamById(person.teamId);
      const archivedBy = accountName(person.archivedBy);
      const businessUnitName = person.archivedBusinessUnit || unitByTeam(person.teamId)?.name || "";
      const teamName = person.archivedTeam || team?.name || "";
      return `<article class="record-item compact-record">
        <header><strong>${escapeHtml(person.employeeNo)} · ${escapeHtml(person.name)}</strong><small>${escapeHtml(person.archivedAt || "")} · ${escapeHtml(archivedBy)}</small></header>
        <p>${escapeHtml([businessUnitName, teamName].filter(Boolean).join(" / "))} · ${escapeHtml(person.role || "")} · ${escapeHtml(person.level || "")} · ${escapeHtml(person.contractType || "")}</p>
        <p>${escapeHtml(person.archiveReason || t("noNotes"))}</p>
      </article>`;
    }).join("")
    : `<div class="empty-state">${t("noMatchedPeople")}</div>`;
}

function renderTalentSettings() {
  if (!elements.talentSettingList) return;
  const tags = state.talentTags.map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`);
  const awards = state.awardNames.map((award) => `<span class="pill award-pill">${escapeHtml(award)}</span>`);
  elements.talentSettingList.innerHTML = [...tags, ...awards].join("") || `<span class="hint">${t("noTags")}</span>`;
}

function renderEditableTypeRows(items, type) {
  return items.map((item) => `<div class="inline-form">
    <input data-type-value="${type}:${escapeHtml(item)}" value="${escapeHtml(item)}" />
    <button type="button" data-save-type="${type}:${escapeHtml(item)}">${t("save")}</button>
    <button type="button" class="text-danger" data-delete-type="${type}:${escapeHtml(item)}">${t("delete")}</button>
  </div>`).join("");
}

function renderDevelopmentSettings() {
  if (!elements.developmentSettingList) return;
  elements.developmentSettingList.innerHTML = `
    <div class="settings-subsection">
      <div class="section-title"><span>${t("actionTypeSettings")}</span></div>
      ${renderEditableTypeRows(state.talentActionTypes, "action")}
    </div>
    <div class="settings-subsection">
      <div class="section-title"><span>${t("activityTypeSettings")}</span></div>
      ${renderEditableTypeRows(state.cultureActivityTypes, "activity")}
    </div>`;
  elements.developmentSettingList.querySelectorAll("[data-save-type]").forEach((button) => {
    button.addEventListener("click", () => saveConfigType(button.dataset.saveType));
  });
  elements.developmentSettingList.querySelectorAll("[data-delete-type]").forEach((button) => {
    button.addEventListener("click", () => deleteConfigType(button.dataset.deleteType));
  });
}

function scopeOptionsForTalent() {
  const scopes = [];
  visibleUnits().forEach((unit) => {
    scopes.push(`<option value="unit:${unit.id}">${escapeHtml(unitDisplayName(unit))}</option>`);
    unit.teams.forEach((team) => scopes.push(`<option value="team:${team.id}">Team · ${escapeHtml(team.name)}</option>`));
  });
  return scopes.join("");
}

function talentVisibleTeams() {
  return visibleTeams().filter((team) => state.selectedTalentUnitId === "all" || team.unitId === state.selectedTalentUnitId);
}

function talentFilteredPeople() {
  const teamIds = new Set(talentVisibleTeams().map((team) => team.id));
  return visiblePeople().filter((person) => {
    const unit = unitByTeam(person.teamId);
    const inUnit = state.selectedTalentUnitId === "all" || unit?.id === state.selectedTalentUnitId;
    const inTeam = state.selectedTalentTeamId === "all" || person.teamId === state.selectedTalentTeamId;
    return teamIds.has(person.teamId) && inUnit && inTeam;
  });
}

function renderTalentFilters() {
  const units = visibleUnits();
  const validUnitIds = new Set(units.map((unit) => unit.id));
  if (state.selectedTalentUnitId !== "all" && !validUnitIds.has(state.selectedTalentUnitId)) state.selectedTalentUnitId = "all";
  elements.talentUnitFilter.innerHTML = [
    `<option value="all">${t("allUnits")}</option>`,
    ...units.map((unit) => `<option value="${unit.id}">${escapeHtml(unitDisplayName(unit))}</option>`),
  ].join("");
  elements.talentUnitFilter.value = state.selectedTalentUnitId;

  const teams = talentVisibleTeams();
  if (state.selectedTalentTeamId !== "all" && !teams.some((team) => team.id === state.selectedTalentTeamId)) state.selectedTalentTeamId = "all";
  elements.talentTeamFilter.innerHTML = [
    `<option value="all">${t("allTeams")}</option>`,
    ...teams.map((team) => `<option value="${team.id}">${escapeHtml(teamDisplayName(team))}</option>`),
  ].join("");
  elements.talentTeamFilter.value = state.selectedTalentTeamId;
}

function visibleUnits() {
  const account = currentAccount();
  if (!account) return [];
  if (["owner", "researchDirector"].includes(account.role)) return state.org.units;
  if (account.role === "hrbp") {
    const unitIds = new Set(visibleTeams().map((team) => team.unitId));
    return state.org.units
      .map((unit) => ({ ...unit, teams: unit.teams.filter((team) => hrbpTeamIds(account.id).includes(team.id)) }))
      .filter((unit) => unitIds.has(unit.id) && unit.teams.length);
  }
  if (["labDirector", "plr", "platformLead"].includes(account.role)) return state.org.units.filter((unit) => unit.id === account.scopeId);
  if (account.role === "teamManager") return state.org.units
    .map((unit) => ({ ...unit, teams: unit.teams.filter((team) => team.id === account.scopeId) }))
    .filter((unit) => unit.teams.length);
  return [];
}

function scopeLabelByValue(scopeValue) {
  const [type, id] = String(scopeValue || "").split(":");
  if (type === "team") {
    const team = teamById(id);
    return `${team?.unitName || ""} / ${team?.name || id}`;
  }
  return state.org.units.find((unit) => unit.id === id)?.name || id;
}

function canSeeScope(scopeValue) {
  const [type, id] = String(scopeValue || "").split(":");
  if (isGlobalViewer()) return true;
  const visibleTeamIds = new Set(visibleTeams().map((team) => team.id));
  if (type === "team") return visibleTeamIds.has(id);
  return visibleTeams().some((team) => team.unitId === id);
}

function renderTalentDevelopment() {
  const options = scopeOptionsForTalent();
  elements.goalScopeSelect.innerHTML = options;
  elements.activityScopeSelect.innerHTML = options;
  renderTalentFilters();
  const currentActionType = elements.talentActionType.value;
  const currentActivityType = elements.activityType.value;
  elements.talentActionType.innerHTML = state.talentActionTypes.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("");
  elements.activityType.innerHTML = state.cultureActivityTypes.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("");
  if (state.talentActionTypes.includes(currentActionType)) elements.talentActionType.value = currentActionType;
  if (state.cultureActivityTypes.includes(currentActivityType)) elements.activityType.value = currentActivityType;
  elements.goalYear.value = elements.goalYear.value || new Date().getFullYear();
  elements.activityDate.value = elements.activityDate.value || today();
  const visibleGoals = state.orgGoals.filter((goal) => canSeeScope(goal.scope));
  const visibleActivities = state.cultureActivities.filter((activity) => canSeeScope(activity.scope));
  const talentPeople = talentFilteredPeople();
  const visiblePersonIds = new Set(talentPeople.map((person) => person.id));
  const visibleActions = state.talentActions.filter((action) => visiblePersonIds.has(action.personId) && !action.archived);
  renderTalentDashboard(visibleActions, talentPeople);
  renderDevelopmentTree(visibleGoals, visibleActivities);
  elements.talentActionPerson.innerHTML = talentPeople
    .map((person) => `<option value="${person.id}">${escapeHtml(person.employeeNo)} · ${escapeHtml(person.name)} · ${escapeHtml(teamById(person.teamId)?.name || "")}</option>`)
    .join("");
  elements.talentActionDueDate.value = elements.talentActionDueDate.value || today();
  if (!editingTalentActionId) elements.addTalentActionBtn.textContent = t("addTalentAction");
  elements.talentActionList.innerHTML = visibleActions.length
    ? visibleActions.map(renderTalentActionCard).join("")
    : `<div class="empty-state">${t("noTalentActions")}</div>`;
  bindTalentActionButtons();
  elements.goalList.innerHTML = visibleGoals.length
    ? visibleGoals.map((goal) => `<article class="record-item"><header><strong>${escapeHtml(scopeLabelByValue(goal.scope))}</strong><small>${escapeHtml(goal.year)}</small></header><p><b>${t("mainWork")}:</b> ${escapeHtml(goal.mainWork)}</p><p><b>${t("mainGoals")}:</b> ${escapeHtml(goal.mainGoals)}</p></article>`).join("")
    : `<div class="empty-state">${t("noGoals")}</div>`;
  elements.activityList.innerHTML = visibleActivities.length
    ? visibleActivities.map((activity) => `<article class="record-item"><header><strong>${escapeHtml(activity.type)} · ${escapeHtml(scopeLabelByValue(activity.scope))}</strong><small>${escapeHtml(activity.date)} · ${Number(activity.participants || 0)} ${t("peopleUnit")}</small></header><p>${escapeHtml(activity.summary)}</p></article>`).join("")
    : `<div class="empty-state">${t("noActivities")}</div>`;
}

function renderTalentDashboard(actions, people = visiblePeople()) {
  const keyTalent = people.filter((person) => (person.talentTags || []).some((tag) => ["领军人物", "优秀人才", "高潜人才", "关键岗位", "AI"].includes(tag)));
  const openActions = actions.filter((action) => action.status !== "Done");
  const retentionRisks = actions.filter((action) => action.type === "Retention Risk" && action.status !== "Done");
  const successors = actions.filter((action) => ["Succession", "Key Role Backup"].includes(action.type));
  const cards = [
    [t("keyTalentCount"), keyTalent.length],
    [t("actionOpenCount"), openActions.length],
    [t("retentionRiskCount"), retentionRisks.length],
    [t("successorCount"), successors.length],
  ];
  elements.talentDashboard.innerHTML = cards.map(([label, value]) => `<div class="stat-card"><strong>${value}</strong><span>${escapeHtml(label)}</span></div>`).join("");
}

function renderTalentActionCard(action) {
  const person = state.people.find((item) => item.id === action.personId);
  const team = person ? teamById(person.teamId) : null;
  return `<article class="record-item compact-record">
    <header><strong>${escapeHtml(action.type)} · ${escapeHtml(person ? `${person.employeeNo} ${person.name}` : t("notFilled"))}</strong><small>${escapeHtml(action.priority)} · ${escapeHtml(action.status)} · ${escapeHtml(action.dueDate || "")}</small></header>
    <p>${escapeHtml(team ? teamDisplayName(team) : "")}</p>
    <p>${escapeHtml(action.note || t("noNotes"))}</p>
    <div class="record-actions owner-hrbp-write">
      <button type="button" data-edit-talent-action="${action.id}">${t("edit")}</button>
      <button type="button" data-archive-talent-action="${action.id}">${t("archive")}</button>
      <button type="button" class="text-danger" data-delete-talent-action="${action.id}">${t("delete")}</button>
    </div>
  </article>`;
}

function renderDevelopmentTree(visibleGoals, visibleActivities) {
  elements.developmentTree.innerHTML = visibleUnits().map((unit) => {
    const unitScope = `unit:${unit.id}`;
    const unitGoals = visibleGoals.filter((goal) => goal.scope === unitScope);
    const unitActivities = visibleActivities.filter((activity) => activity.scope === unitScope);
    const teamGoals = unit.teams.flatMap((team) => visibleGoals.filter((goal) => goal.scope === `team:${team.id}`));
    const teamActivities = unit.teams.flatMap((team) => visibleActivities.filter((activity) => activity.scope === `team:${team.id}`));
    return `<details class="dev-unit">
      <summary>
        <span><strong>${escapeHtml(unitDisplayName(unit))}</strong><small>${unitGoals.length + teamGoals.length} goals · ${unitActivities.length + teamActivities.length} activities</small></span>
      </summary>
      <div class="dev-unit-body">
        <section class="dev-node">
          <div class="dev-node-title">${escapeHtml(unit.name)} · ${t("annualWorkGoals")}</div>
          ${renderGoalCards(unitGoals)}
          ${renderActivityCards(unitActivities)}
        </section>
        <div class="dev-teams">
          ${unit.teams.map((team) => {
            const goals = visibleGoals.filter((goal) => goal.scope === `team:${team.id}`);
            const activities = visibleActivities.filter((activity) => activity.scope === `team:${team.id}`);
            return `<details class="dev-team">
              <summary><span>${escapeHtml(team.name)}</span><small>${goals.length} goals · ${activities.length} activities</small></summary>
              <div class="dev-team-body">
                <p class="leader-line"><b>${t("teamManager")}</b><span>${escapeHtml(accountName(team.managerAccountId))}</span></p>
                ${renderGoalCards(goals)}
                ${renderActivityCards(activities)}
              </div>
            </details>`;
          }).join("")}
        </div>
      </div>
    </details>`;
  }).join("") || `<div class="empty-state">${t("noMatchedPeople")}</div>`;
}

function renderGoalCards(goals) {
  return goals.length
    ? goals.map((goal) => `<article class="record-item compact-record"><header><strong>${escapeHtml(goal.year)}</strong><small>${t("mainGoals")}</small></header><p><b>${t("mainWork")}:</b> ${escapeHtml(goal.mainWork)}</p><p><b>${t("mainGoals")}:</b> ${escapeHtml(goal.mainGoals)}</p></article>`).join("")
    : `<div class="empty-state small-empty">${t("noGoals")}</div>`;
}

function renderActivityCards(activities) {
  return activities.length
    ? activities.map((activity) => `<article class="record-item compact-record"><header><strong>${escapeHtml(activity.type)}</strong><small>${escapeHtml(activity.date)} · ${Number(activity.participants || 0)} ${t("peopleUnit")}</small></header><p>${escapeHtml(activity.summary)}</p></article>`).join("")
    : `<div class="empty-state small-empty">${t("noActivities")}</div>`;
}

function renderScopeOptions() {
  const role = elements.newAccountRole.value || "researchDirector";
  if (role === "researchDirector") {
    elements.newAccountScope.innerHTML = `<option value="center-1">${escapeHtml(state.org.center.name)}</option>`;
    elements.newAccountScope.multiple = false;
    elements.newAccountScope.size = 1;
    return;
  }
  if (role === "hrbp") {
    elements.newAccountScope.multiple = false;
    elements.newAccountScope.size = 1;
    elements.newAccountScope.innerHTML = `<option value="teams">${t("assignedTeams")}</option>`;
    return;
  }
  if (["labDirector", "plr", "platformLead", "hrbp"].includes(role)) {
    elements.newAccountScope.multiple = role === "hrbp";
    elements.newAccountScope.size = role === "hrbp" ? Math.min(5, state.org.units.length) : 1;
    elements.newAccountScope.innerHTML = state.org.units
      .filter((unit) => role === "hrbp" || (role === "platformLead" ? unit.type === "platform" : unit.type === "lab"))
      .map((unit) => `<option value="${unit.id}">${escapeHtml(unit.name)}</option>`)
      .join("");
    return;
  }
  elements.newAccountScope.multiple = false;
  elements.newAccountScope.size = 1;
  elements.newAccountScope.innerHTML = allTeams().map((team) => `<option value="${team.id}">${escapeHtml(teamDisplayName(team))}</option>`).join("");
}

function scopeLabel(account) {
  if (account.scopeType === "center") return state.org.center.name;
  if (account.role === "hrbp") {
    const teams = hrbpTeamIds(account.id).map((id) => teamById(id)).filter(Boolean);
    return teams.length ? teams.map((team) => team.name).join(", ") : t("assignedTeams");
  }
  if (account.scopeType === "unit") return state.org.units.find((unit) => unit.id === account.scopeId)?.name || "";
  return teamById(account.scopeId)?.name || "";
}

function renderTeamFilter() {
  const units = visibleUnits();
  elements.labList.innerHTML = "";
  const showAllUnits = isGlobalViewer() || units.length > 1;
  if (!showAllUnits && units[0]) state.selectedUnitId = units[0].id;
  if (showAllUnits) {
    const allUnits = document.createElement("div");
    allUnits.className = `team-button${state.selectedUnitId === "all" ? " active" : ""}`;
    allUnits.dataset.unitId = "all";
    allUnits.innerHTML = `<span>${t("allUnits")}</span><small>${visiblePeople().length} ${t("peopleUnit")}</small>`;
    elements.labList.append(allUnits);
  }
  units.forEach((unit) => {
    const teamIds = new Set(unit.teams.map((team) => team.id));
    const count = visiblePeople().filter((person) => teamIds.has(person.teamId)).length;
    const item = document.createElement("div");
    item.className = `team-button${state.selectedUnitId === unit.id ? " active" : ""}`;
    item.dataset.unitId = unit.id;
    item.innerHTML = `<span>${escapeHtml(unitDisplayName(unit))}</span><small>${count} ${t("peopleUnit")}</small>`;
    elements.labList.append(item);
  });

  const teams = visibleTeams().filter((team) => state.selectedUnitId === "all" || team.unitId === state.selectedUnitId);
  if (state.selectedTeamId !== "all" && !teams.some((team) => team.id === state.selectedTeamId)) {
    state.selectedTeamId = "all";
  }
  elements.teamList.innerHTML = "";
  const showAllTeams = teams.length > 1;
  if (!showAllTeams && teams[0]) state.selectedTeamId = teams[0].id;
  const scopedPeopleCount = visiblePeople().filter((person) => {
    const unit = unitByTeam(person.teamId);
    return state.selectedUnitId === "all" || unit?.id === state.selectedUnitId;
  }).length;
  if (showAllTeams) {
    const all = document.createElement("div");
    all.className = `team-button${state.selectedTeamId === "all" ? " active" : ""}`;
    all.dataset.teamId = "all";
    all.innerHTML = `<span>${t("allTeams")}</span><small>${scopedPeopleCount} ${t("peopleUnit")}</small>`;
    elements.teamList.append(all);
  }
  teams.forEach((team) => {
    const count = visiblePeople().filter((person) => person.teamId === team.id).length;
    const item = document.createElement("div");
    item.className = `team-button${state.selectedTeamId === team.id ? " active" : ""}`;
    item.dataset.teamId = team.id;
    item.innerHTML = `<span>${escapeHtml(team.name)}</span><small>${count} ${t("peopleUnit")}</small>`;
    elements.teamList.append(item);
  });
}

function renderOrgChart() {
  const visibleTeamIds = new Set(visibleTeams().map((team) => team.id));
  const units = visibleUnits();
  const visiblePeopleList = visiblePeople();
  elements.orgChart.innerHTML = `
    <div class="org-root">
      <div class="org-root-title">
        <strong>${escapeHtml(state.org.center.name)}</strong>
        <span>${visiblePeopleList.length} ${t("members")}</span>
      </div>
      <div class="org-root-leader"><b>${t("centerDirector")}</b><span>${escapeHtml(accountName(state.org.center.directorAccountId))}</span></div>
    </div>
    <div class="org-units">
      ${units.map((unit) => {
        const visibleTeamsForUnit = unit.teams.filter((team) => visibleTeamIds.has(team.id));
        const unitPeopleCount = visibleTeamsForUnit.reduce((sum, team) => sum + visiblePeopleList.filter((person) => person.teamId === team.id).length, 0);
        const unitLeaderLabel = unit.type === "platform" ? t("platformLead") : unit.type === "researchTeam" ? t("teamManager") : t("labDirector");
        const unitLeaderId = unit.type === "researchTeam" ? unit.teams[0]?.managerAccountId : unit.directorAccountId;
        return `<details class="org-unit">
          <summary>
            <span><strong>${escapeHtml(unitDisplayName(unit))}</strong><small>${unit.type === "researchTeam" ? "" : `${visibleTeamsForUnit.length} Teams · `}${unitPeopleCount} ${t("members")}</small></span>
          </summary>
          <div class="org-unit-body">
            <p class="leader-line"><b>${unitLeaderLabel}</b><span>${escapeHtml(accountName(unitLeaderId))}</span></p>
            ${unit.plrAccountId ? `<p class="leader-line"><b>PLR</b><span>${escapeHtml(accountName(unit.plrAccountId))}</span></p>` : ""}
          <div class="org-teams">
            ${visibleTeamsForUnit.map((team) => {
              const teamPeople = visiblePeopleList.filter((person) => person.teamId === team.id);
              return `<div class="org-team ${state.selectedOverviewTeamId === team.id ? "selected-team" : ""}" data-team-id="${team.id}">
                <button type="button" class="org-team-head" data-team-select="${team.id}">
                  <span>${escapeHtml(team.name)}</span>
                  <small>${teamPeople.length} ${t("members")}</small>
                </button>
                <small class="leader-line team-manager-line"><b>${t("teamManager")}</b><span>${escapeHtml(accountName(team.managerAccountId))}</span></small>
                <div class="tree-members">${teamPeople.map((person) => `<button type="button" class="tree-member" data-person-id="${person.id}"><span class="tree-member-main"><b>${escapeHtml(person.employeeNo)}</b><strong>${escapeHtml(person.name)}</strong></span><small>${escapeHtml([person.level, person.role].filter(Boolean).join(" · "))}</small></button>`).join("") || `<div class="empty-state">${t("noMatchedPeople")}</div>`}</div>
              </div>`;
            }).join("")}
          </div>
          </div>
        </details>`;
      }).join("")}
    </div>`;
  elements.orgChart.querySelectorAll("[data-team-select]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      state.selectedOverviewTeamId = button.dataset.teamSelect;
      saveAndRender();
    });
  });
  elements.orgChart.querySelectorAll("[data-person-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openProfile(button.dataset.personId);
    });
  });
}

function renderOverviewRoster() {
  const team = visibleTeams().find((item) => item.id === state.selectedOverviewTeamId) || visibleTeams()[0];
  if (!team) {
    elements.overviewTeamTitle.textContent = t("memberPreview");
    elements.overviewTeamCount.textContent = "";
    elements.overviewTeamRoster.innerHTML = `<div class="empty-state">${t("noMatchedPeople")}</div>`;
    return;
  }
  state.selectedOverviewTeamId = team.id;
  const people = visiblePeople().filter((person) => person.teamId === team.id);
  elements.overviewTeamTitle.textContent = team.name;
  elements.overviewTeamCount.textContent = `${people.length} ${t("members")}`;
  elements.overviewTeamRoster.innerHTML = people
    .map((person) => `<button type="button" class="roster-row" data-person-id="${person.id}"><strong>${escapeHtml(person.employeeNo)}</strong><span>${escapeHtml(person.name)}</span><small>${escapeHtml(person.role)} · ${escapeHtml(person.level)}</small></button>`)
    .join("");
  elements.overviewTeamRoster.querySelectorAll("[data-person-id]").forEach((button) => {
    button.addEventListener("click", () => openProfile(button.dataset.personId));
  });
}

function renderSummary() {
  const people = visiblePeople();
  elements.totalPeople.textContent = people.length;
  elements.regularPeople.textContent = people.filter((person) => person.contractType === "Employee").length;
  elements.avgTenure.textContent = people.length ? (people.reduce((sum, person) => sum + tenureYears(person.startDate), 0) / people.length).toFixed(1) : "0";
}

function renderPeople() {
  const people = filteredPeople();
  const visibleSlice = people.slice(0, state.peopleDisplayLimit);
  elements.selectedTeamTitle.textContent = state.selectedTeamId === "all" ? t("allTeams") : teamById(state.selectedTeamId)?.name || t("allTeams");
  elements.selectedTeamCount.textContent = t("showingPeople", { shown: Math.min(visibleSlice.length, people.length), total: people.length });
  if (!people.length) {
    elements.peopleGrid.innerHTML = `<div class="empty-state">${t("noMatchedPeople")}</div>`;
    return;
  }
  elements.peopleGrid.innerHTML = "";
  visibleSlice.forEach((person) => {
    const team = teamById(person.teamId);
    const unit = unitByTeam(person.teamId);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "person-card";
    const tags = (person.talentTags || []).slice(0, 4).map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("");
    const awardTags = (person.awards || []).slice(0, 3).map((award) => `<span class="pill award-pill">${escapeHtml(award.name)}</span>`).join("");
    const openActions = openTalentActionsForPerson(person.id);
    const actionTags = openActions.slice(0, 2).map((action) => `<span class="pill action-pill">${escapeHtml(action.type)}</span>`).join("");
    const highlightTags = `${tags}${awardTags}${actionTags}`;
    card.innerHTML = `<header><div><h3>${escapeHtml(person.employeeNo)} · ${escapeHtml(person.name)}</h3><p>${escapeHtml(unit?.name || "")} / ${escapeHtml(team?.name || "")}</p></div><div class="card-badges"><span class="badge level-badge">${t("level")} ${escapeHtml(person.level || t("notFilled"))}</span><span class="badge">${escapeHtml(person.contractType)}</span></div></header>
      <div class="metric-grid"><div class="metric"><strong>${tenureLabel(person.startDate)}</strong><small>${t("tenure")}</small></div><div class="metric"><strong>${person.awards?.length || 0}</strong><small>${t("awardName")}</small></div><div class="metric"><strong>${openActions.length}</strong><small>${t("openTalentActions")}</small></div></div>
      ${highlightTags ? `<div class="tag-cloud">${highlightTags}</div>` : ""}
      <p>${escapeHtml(person.role)}</p>
      <p>${escapeHtml(person.notes || t("noNotes"))}</p>`;
    card.addEventListener("click", () => openProfile(person.id));
    const actions = document.createElement("div");
    actions.className = "card-actions";
    actions.innerHTML = `<span>${person.records?.length || 0} ${t("recordCount")}</span>`;
    card.append(actions);
    elements.peopleGrid.append(card);
  });
  if (people.length > state.peopleDisplayLimit) {
    const loadMore = document.createElement("button");
    loadMore.type = "button";
    loadMore.className = "load-more";
    loadMore.textContent = t("loadMore");
    loadMore.addEventListener("click", () => {
      state.peopleDisplayLimit += 24;
      saveAndRender();
    });
    elements.peopleGrid.append(loadMore);
  }
}

function renderBreakdown(container, rows, total) {
  const safeTotal = Math.max(total, 1);
  container.innerHTML = rows.length
    ? rows.map((row) => `<div class="breakdown-row"><div><span>${escapeHtml(row.label)}</span><strong>${row.count} ${t("peopleUnit")}</strong></div><div class="bar"><span style="width: ${Math.round(row.count / safeTotal * 100)}%"></span></div></div>`).join("")
    : `<div class="empty-state">${t("noMatchedPeople")}</div>`;
}

function countRows(items, labelGetter) {
  const counts = new Map();
  items.forEach((item) => {
    const label = labelGetter(item) || t("notFilled");
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function renderPeopleStatistics() {
  const people = filteredPeople();
  const total = Math.max(people.length, 1);
  renderBreakdown(elements.contractBreakdown, CONTRACT_TYPES.map((contract) => ({
    label: contract,
    count: people.filter((person) => person.contractType === contract).length,
  })), total);
  renderBreakdown(elements.levelBreakdown, countRows(people, (person) => person.level).slice(0, 8), total);
  renderBreakdown(elements.orgBreakdown, countRows(people, (person) => unitByTeam(person.teamId)?.name).slice(0, 8), total);
  renderBreakdown(elements.talentStats, [
    { label: t("taggedPeople"), count: people.filter((person) => person.talentTags?.length).length },
    { label: t("awardedPeople"), count: people.filter((person) => person.awards?.length).length },
    { label: t("growthPeople"), count: people.filter((person) => person.growth?.length).length },
  ], total);
}

function refreshFormOptions() {
  elements.personForm.elements.teamId.innerHTML = allTeams().map((team) => `<option value="${team.id}">${escapeHtml(teamDisplayName(team))}</option>`).join("");
  elements.personForm.elements.institute.innerHTML = state.org.units.map((unit) => `<option value="${unit.id}">${escapeHtml(unit.name)}</option>`).join("");
  elements.personForm.elements.managerId.innerHTML = [`<option value="">${t("noManager")}</option>`, ...state.accounts.filter((account) => account.role === "teamManager").map((account) => `<option value="${account.id}">${escapeHtml(account.name)}</option>`)].join("");
  elements.profileManager.innerHTML = elements.personForm.elements.managerId.innerHTML;
  elements.deleteEmployeeForm.elements.personId.innerHTML = state.people
    .map((person) => `<option value="${person.id}">${escapeHtml(person.employeeNo)} · ${escapeHtml(person.name)} · ${escapeHtml(teamDisplayName(teamById(person.teamId)))}</option>`)
    .join("");
}

function saveAndRender() {
  saveState();
  render();
}

function tenureYears(startDate) {
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return 0;
  return Math.max(0, (Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

function tenureLabel(startDate) {
  const years = tenureYears(startDate);
  if (years < 1) return state.language === "en" ? `${Math.max(1, Math.floor(years * 12))} mo` : `${Math.max(1, Math.floor(years * 12))} 个月`;
  return state.language === "en" ? `${years.toFixed(1)} yrs` : `${years.toFixed(1)} 年`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function openProfile(personId) {
  const person = state.people.find((item) => item.id === personId);
  if (!canViewPerson(person)) return;
  activePersonId = personId;
  editingBasicInfo = false;
  [elements.talentEditor, elements.growthEditor, elements.managerRecordEditor, elements.profileTalentActionEditor, elements.talentInsightEditor].forEach((editor) => {
    if (editor) editor.open = false;
  });
  renderProfile();
  elements.profileDialog.showModal();
}

function renderProfile() {
  const person = state.people.find((item) => item.id === activePersonId);
  const team = teamById(person.teamId);
  const unit = unitByTeam(person.teamId);
  elements.profileName.textContent = `${person.employeeNo} · ${person.name}`;
  elements.profileMeta.textContent = `${unit?.name || ""} / ${team?.name || ""}`;
  if (editingBasicInfo) renderBasicInfoEditor(person);
  else renderBasicInfoView(person, team, unit);
  elements.editBasicInfoBtn.classList.toggle("is-hidden", !canAddDeleteEmployees() || editingBasicInfo);
  elements.profileManager.value = team?.managerAccountId || "";
  const canTalentProfile = canEditTalentProfile(person);
  elements.talentEditor.classList.toggle("is-hidden", !canTalentProfile);
  elements.growthEditor.classList.toggle("is-hidden", !canTalentProfile);
  elements.addPersonTagBtn.classList.toggle("is-hidden", !canTalentProfile);
  elements.addAwardBtn.classList.toggle("is-hidden", !canTalentProfile);
  elements.addGrowthBtn.classList.toggle("is-hidden", !canTalentProfile);
  elements.talentTagSelect.innerHTML = state.talentTags.map((tag) => `<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`).join("");
  elements.awardNameSelect.innerHTML = state.awardNames.map((award) => `<option value="${escapeHtml(award)}">${escapeHtml(award)}</option>`).join("");
  elements.awardDate.value = today();
  elements.growthDate.value = today();
  renderTalentHighlights(person);
  renderGrowth(person);
  renderProfileTalentActions(person);
  renderProfileRecordEditors(person);
  renderRecords(person);
}

function renderBasicInfoView(person, team, unit) {
  elements.profileBasics.className = "info-list";
  elements.profileBasics.innerHTML = [
    [t("employeeNo"), person.employeeNo], [t("name"), person.name], [t("businessUnit"), unitDisplayName(unit)], [t("team"), team?.name],
    [t("role"), person.role], [t("level"), person.level], [t("contractType"), person.contractType], [t("startDate"), person.startDate],
    [t("tenure"), tenureLabel(person.startDate)], [t("notes"), person.notes || t("noNotes")],
  ].map(([label, value]) => `<div class="info-item"><small>${label}</small><strong>${escapeHtml(value)}</strong></div>`).join("");
}

function renderBasicInfoEditor(person) {
  elements.profileBasics.className = "basic-info-form";
  const teamOptions = allTeams()
    .map((team) => `<option value="${team.id}">${escapeHtml(teamDisplayName(team))}</option>`)
    .join("");
  elements.profileBasics.innerHTML = `
    <div class="form-grid">
      <label><span>${t("employeeNo")}</span><input id="editEmployeeNo" type="text" value="${escapeHtml(person.employeeNo || "")}" /></label>
      <label><span>${t("name")}</span><input id="editPersonName" type="text" value="${escapeHtml(person.name || "")}" /></label>
      <label><span>${t("team")}</span><select id="editPersonTeam">${teamOptions}</select></label>
      <label><span>${t("role")}</span><input id="editPersonRole" type="text" value="${escapeHtml(person.role || "")}" /></label>
      <label><span>${t("level")}</span><input id="editPersonLevel" type="text" value="${escapeHtml(person.level || "")}" /></label>
      <label><span>${t("contractType")}</span><select id="editPersonContractType">${CONTRACT_TYPES.map((type) => `<option value="${type}">${type}</option>`).join("")}</select></label>
      <label><span>${t("startDate")}</span><input id="editPersonStartDate" type="date" value="${escapeHtml(person.startDate || today())}" /></label>
    </div>
    <label><span>${t("notes")}</span><textarea id="editPersonNotes" rows="3">${escapeHtml(person.notes || "")}</textarea></label>
    <div class="dialog-actions">
      <button id="cancelBasicInfoBtn" type="button">${t("cancel")}</button>
      <button id="saveBasicInfoBtn" type="button" class="primary">${t("saveBasicInfo")}</button>
    </div>`;
  $("#editPersonTeam").value = person.teamId || "";
  $("#editPersonContractType").value = normalizeContractType(person.contractType);
}

function saveBasicInfo() {
  if (!canAddDeleteEmployees()) return;
  const person = state.people.find((item) => item.id === activePersonId);
  if (!person) return;
  const employeeNo = $("#editEmployeeNo")?.value.trim();
  const name = $("#editPersonName")?.value.trim();
  const teamId = $("#editPersonTeam")?.value;
  const role = $("#editPersonRole")?.value.trim();
  const level = normalizeLevelValue($("#editPersonLevel")?.value.trim());
  const contractType = normalizeContractType($("#editPersonContractType")?.value);
  const startDate = $("#editPersonStartDate")?.value || today();
  const notes = $("#editPersonNotes")?.value.trim();
  if (!employeeNo || !name || !teamId || !role || !level || !startDate) {
    showValidation("validationRequired");
    return;
  }
  if (!isValidEmployeeNoForContract(employeeNo, contractType)) {
    showValidation("invalidEmployeeNo");
    return;
  }
  if (state.people.some((item) => item.id !== person.id && String(item.employeeNo).toLowerCase() === employeeNo.toLowerCase())) {
    showValidation("duplicateEmployeeNo");
    return;
  }
  if (!confirmAction(t("saveBasicInfo"))) return;
  state.people = state.people.map((item) => item.id === person.id
    ? { ...item, employeeNo, name, teamId, role, level, contractType, startDate, notes }
    : item);
  if (person.accountId) {
    state.accounts = state.accounts.map((account) => account.id === person.accountId ? { ...account, name } : account);
  }
  editingBasicInfo = false;
  saveAndRender();
  renderProfile();
  showToast(t("basicInfoSaved"));
}

function renderProfileTalentActions(person) {
  const actions = state.talentActions.filter((action) => action.personId === person.id && !action.archived);
  elements.profileTalentActions.innerHTML = actions.length
    ? actions.map(renderTalentActionCard).join("")
    : `<div class="empty-state">${t("noTalentActions")}</div>`;
  bindTalentActionButtons(elements.profileTalentActions);
  const canAdd = canAddTalentActionForPerson(person);
  elements.profileTalentActionEditor.classList.toggle("is-hidden", !canAdd);
  elements.profileTalentActionType.innerHTML = state.talentActionTypes.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("");
  elements.profileTalentActionDueDate.value = today();
}

function renderProfileRecordEditors(person) {
  const canManager = canAddManagerRecord(person);
  const canTalent = canAddTalentInsight(person);
  elements.managerRecordEditor.classList.toggle("is-hidden", !canManager);
  elements.managerRecordPermissionText.textContent = canManager ? t("canAdd") : t("readOnly");
  elements.managerRecordType.innerHTML = [["优秀事迹", t("managerAchievement")], ["平时表现", t("managerPerformance")]]
    .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
    .join("");
  elements.managerRecordDate.value = today();

  elements.talentInsightEditor.classList.toggle("is-hidden", !canTalent);
  elements.talentInsightPermissionText.textContent = canTalent ? t("canAdd") : t("readOnly");
  elements.talentInsightType.innerHTML = [["Talent Insight", t("talentInsight")], ["人才风险", t("talentRisk")], ["培养建议", t("developmentSuggestion")]]
    .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
    .join("");
  elements.talentInsightDate.value = today();
}

function renderTalentHighlights(person) {
  const canTalentProfile = canEditTalentProfile(person);
  elements.personTalentTags.innerHTML = (person.talentTags || []).length
    ? person.talentTags.map((tag) => `<span class="pill removable-pill">${escapeHtml(tag)}${canTalentProfile ? `<button type="button" data-remove-person-tag="${escapeHtml(tag)}">×</button>` : ""}</span>`).join("")
    : "";
  elements.personAwards.innerHTML = (person.awards || []).length
    ? person.awards.map((award) => {
      const meta = [award.date, award.note].filter(Boolean).join(" · ");
      return `<span class="pill award-pill removable-pill highlight-pill"><strong>${escapeHtml(award.name)}</strong>${meta ? `<small>${escapeHtml(meta)}</small>` : ""}${canTalentProfile ? `<button type="button" data-remove-award="${award.id}">×</button>` : ""}</span>`;
    }).join("")
    : `<span class="hint">${t("noAwards")}</span>`;
  elements.personTalentTags.querySelectorAll("[data-remove-person-tag]").forEach((button) => {
    button.addEventListener("click", () => removePersonTag(button.dataset.removePersonTag));
  });
  elements.personAwards.querySelectorAll("[data-remove-award]").forEach((button) => {
    button.addEventListener("click", () => removeAward(button.dataset.removeAward));
  });
}

function renderGrowth(person) {
  elements.growthTimeline.innerHTML = (person.growth || []).length
    ? person.growth.map((item) => `<div class="history-row"><span>${escapeHtml(item.date || "")}</span><strong>${escapeHtml(item.type)}</strong><small>${escapeHtml(item.note || "")}</small></div>`).join("")
    : `<div class="empty-state">${t("noGrowth")}</div>`;
}

function renderRecords(person) {
  const records = [...(person.records || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const managerTypes = new Set(["优秀事迹", "平时表现"]);
  const talentTypes = new Set(["Talent Insight", "人才风险", "培养建议", "HRBP记录"]);
  const renderRecordCards = (items) => items.length
    ? items.map((record) => `<article class="record-item"><header><strong>${escapeHtml(record.type === "HRBP记录" ? t("talentInsight") : record.type)}</strong><small>${escapeHtml(record.date)} · ${escapeHtml(accountName(record.authorId))}</small></header><p>${escapeHtml(record.content)}</p></article>`).join("")
    : `<div class="empty-state">${t("noRecords")}</div>`;
  elements.managerRecordList.innerHTML = renderRecordCards(records.filter((record) => managerTypes.has(record.type)));
  elements.talentInsightList.innerHTML = renderRecordCards(records.filter((record) => talentTypes.has(record.type)));
}

function addPerson(event) {
  event.preventDefault();
  if (!canAddDeleteEmployees()) return;
  const data = new FormData(elements.personForm);
  if (!data.get("employeeNo")?.trim() || !data.get("name")?.trim() || !data.get("teamId")) {
    showValidation("validationRequired");
    return;
  }
  if (!confirmAction(t("addEmployee"))) return;
  state.people.push({
    id: `p-${crypto.randomUUID()}`, employeeNo: data.get("employeeNo").trim(), name: data.get("name").trim(), teamId: data.get("teamId"),
    role: data.get("role").trim(), level: data.get("level").trim() || t("notFilled"), contractType: data.get("contractType"),
    startDate: data.get("startDate"), notes: data.get("notes").trim(), talentTags: [], awards: [], growth: [], records: [],
  });
  const managerId = data.get("managerId");
  if (managerId) assignTeamManager(data.get("teamId"), managerId);
  elements.personDialog.close();
  elements.personForm.reset();
  saveAndRender();
}

function openDeleteEmployeeDialog() {
  if (!canAddDeleteEmployees()) return;
  refreshFormOptions();
  if (!state.people.length) {
    showValidation("validationRequired");
    return;
  }
  elements.deleteEmployeeDialog.showModal();
}

function archiveEmployee(event) {
  event.preventDefault();
  if (!canAddDeleteEmployees()) return;
  const data = new FormData(elements.deleteEmployeeForm);
  const personId = data.get("personId");
  const reason = data.get("reason")?.trim();
  const person = state.people.find((item) => item.id === personId);
  if (!person || !reason) {
    showValidation("validationRequired");
    return;
  }
  if (!confirmAction(t("confirmDeleteEmployee", { name: `${person.employeeNo} ${person.name}` }))) return;
  const team = teamById(person.teamId);
  const unit = unitByTeam(person.teamId);
  state.formerPeople.unshift({
    ...person,
    archivedBusinessUnit: unitDisplayName(unit),
    archivedTeam: team?.name || "",
    archivedAt: today(),
    archivedBy: state.sessionAccountId,
    archiveReason: reason,
    archiveType: "formerEmployee",
  });
  state.people = state.people.filter((item) => item.id !== person.id);
  if (activePersonId === person.id) {
    activePersonId = "";
    elements.profileDialog.close();
  }
  elements.deleteEmployeeDialog.close();
  elements.deleteEmployeeForm.reset();
  saveAndRender();
  showToast(t("employeeArchived"));
}

function archiveSelectedEmployees() {
  if (!canAddDeleteEmployees()) return;
  const selectedIds = [...elements.bulkArchivePeopleList.querySelectorAll("[data-bulk-archive-person]:checked")]
    .map((input) => input.dataset.bulkArchivePerson);
  const reason = elements.bulkArchiveReason.value.trim();
  if (!selectedIds.length || !reason) {
    showValidation("validationRequired");
    return;
  }
  if (!confirmAction(t("confirmArchiveEmployees", { count: selectedIds.length }))) return;
  const selected = new Set(selectedIds);
  const archivedAt = today();
  const archivedPeople = state.people
    .filter((person) => selected.has(person.id))
    .map((person) => ({
      ...person,
      archivedBusinessUnit: unitDisplayName(unitByTeam(person.teamId)),
      archivedTeam: teamById(person.teamId)?.name || "",
      archivedAt,
      archivedBy: state.sessionAccountId,
      archiveReason: reason,
      archiveType: "formerEmployee",
    }));
  state.formerPeople = [...archivedPeople.reverse(), ...(state.formerPeople || [])];
  state.people = state.people.filter((person) => !selected.has(person.id));
  if (selected.has(activePersonId)) {
    activePersonId = "";
    elements.profileDialog.close();
  }
  elements.bulkArchiveReason.value = "";
  saveAndRender();
  showToast(t("employeesArchived", { count: archivedPeople.length }));
}

function downloadFormerEmployeesArchive() {
  const rows = [
    ["employeeNo", "name", "businessUnit", "team", "role", "level", "contractType", "startDate", "archivedAt", "archivedBy", "archiveReason", "notes"],
    ...(state.formerPeople || []).map((person) => {
      const team = teamById(person.teamId);
      const unit = unitByTeam(person.teamId);
      return [
        person.employeeNo,
        person.name,
        person.archivedBusinessUnit || unitDisplayName(unit),
        person.archivedTeam || team?.name || "",
        person.role,
        person.level,
        person.contractType,
        person.startDate,
        person.archivedAt,
        accountName(person.archivedBy),
        person.archiveReason,
        person.notes,
      ];
    }),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(csvEscape).join(",")).join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `former_employee_archive_${today()}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function parseDelimitedText(text) {
  const delimiter = text.includes("\t") ? "\t" : ",";
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeImportKey(value) {
  return String(value || "").trim().toLowerCase().replace(/[\s_\-./()（）]/g, "");
}

function importValue(record, keys) {
  for (const key of keys) {
    const value = record[normalizeImportKey(key)];
    if (value) return value.trim();
  }
  return "";
}

function findImportTeam(record) {
  const teamId = importValue(record, ["teamId", "team id", "team编号", "teamid"]);
  if (teamId && teamById(teamId)) return teamId;
  const teamName = importValue(record, ["team", "teamName", "team name", "团队", "团队名称"]);
  const unitName = importValue(record, ["businessUnit", "business unit", "unit", "lab", "platform", "组织", "业务单元"]);
  if (!teamName) return "";
  const normalized = teamName.toLowerCase().trim();
  const normalizedUnit = unitName.toLowerCase().trim();
  const match = allTeams().find((team) => {
    const unit = state.org.units.find((item) => item.id === team.unitId);
    if (normalizedUnit && String(unit?.name || "").toLowerCase().trim() !== normalizedUnit) return false;
    return [team.id, team.name, teamDisplayName(team), `${unit?.name || ""}/${team.name}`, `${unit?.name || ""} / ${team.name}`]
      .some((candidate) => String(candidate || "").toLowerCase().trim() === normalized);
  });
  return match?.id || "";
}

function buildImportPeople(text) {
  const rows = parseDelimitedText(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map(normalizeImportKey);
  return rows.slice(1).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] || "";
    });
    const employeeNo = importValue(record, ["employeeNo", "employee no", "employeeId", "employee id", "工号"]);
    const name = importValue(record, ["name", "姓名", "员工姓名"]);
    const teamId = findImportTeam(record);
    if (!employeeNo || !name || !teamId) return null;
    return {
      employeeNo,
      name,
      teamId,
      role: importValue(record, ["role", "岗位", "职位", "title"]) || t("notFilled"),
      level: importValue(record, ["level", "职级", "grade"]) || t("notFilled"),
      contractType: normalizeContractType(importValue(record, ["contractType", "contract type", "合同类型"])),
      startDate: importValue(record, ["startDate", "start date", "入职日期"]) || today(),
      notes: importValue(record, ["notes", "备注", "comment"]) || "",
    };
  });
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function downloadImportTemplate() {
  const sampleTeam = allTeams()[0];
  const rows = [
    ["employeeNo", "name", "businessUnit", "team", "role", "level", "contractType", "startDate", "notes"],
    ["00123456", state.language === "en" ? "Example Name" : "Example Name", sampleTeam?.unitName || "", sampleTeam?.name || "", "Research Engineer", "15", "Employee", today(), ""],
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(csvEscape).join(",")).join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "employee_import_template.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function importEmployeesFromText() {
  if (!canAddDeleteEmployees()) return;
  const text = elements.employeeImportText.value.trim();
  if (!text) {
    elements.employeeImportResult.textContent = t("importNoData");
    return;
  }
  const imported = buildImportPeople(text);
  const validImported = imported.filter(Boolean);
  if (!validImported.length) {
    elements.employeeImportResult.textContent = t("importMissingColumns");
    return;
  }
  if (!confirmAction(t("bulkImportEmployees"))) return;
  let added = 0;
  let updated = 0;
  let skipped = 0;
  const addOnly = elements.employeeImportMode.value === "addOnly";
  skipped = imported.length - validImported.length;
  validImported.forEach((person) => {
    const existing = state.people.find((item) => item.employeeNo === person.employeeNo);
    if (existing) {
      if (addOnly) {
        skipped += 1;
        return;
      }
      Object.assign(existing, person);
      updated += 1;
      return;
    }
    state.people.push({ id: `p-${crypto.randomUUID()}`, ...person, talentTags: [], awards: [], growth: [], records: [] });
    added += 1;
  });
  elements.employeeImportResult.textContent = t("importDone", { added, updated, skipped });
  saveAndRender();
}

function assignTeamManager(teamId, managerId) {
  state.org.units = state.org.units.map((unit) => ({
    ...unit,
    teams: unit.teams.map((team) => team.id === teamId ? { ...team, managerAccountId: managerId } : team),
  }));
}

function clearLeadershipRefs(accountId) {
  if (state.org.center.directorAccountId === accountId) state.org.center.directorAccountId = "";
  state.org.units = state.org.units.map((unit) => ({
    ...unit,
    directorAccountId: unit.directorAccountId === accountId ? "" : unit.directorAccountId,
    plrAccountId: unit.plrAccountId === accountId ? "" : unit.plrAccountId,
    teams: unit.teams.map((team) => ({
      ...team,
      managerAccountId: team.managerAccountId === accountId ? "" : team.managerAccountId,
    })),
  }));
}

function applyLeadershipAssignment(account) {
  if (account.role === "researchDirector") {
    state.org.center.directorAccountId = account.id;
    return;
  }
  if (account.role === "teamManager") {
    assignTeamManager(account.scopeId, account.id);
    return;
  }
  if (["labDirector", "platformLead", "plr"].includes(account.role)) {
    state.org.units = state.org.units.map((unit) => {
      if (unit.id !== account.scopeId) return unit;
      if (account.role === "plr") return { ...unit, plrAccountId: account.id };
      return { ...unit, directorAccountId: account.id };
    });
  }
}

function nextEmployeeNo() {
  return nextFormattedEmployeeNo("Employee", new Set(state.people.map((person) => String(person.employeeNo || ""))), state.people.length);
}

function defaultTeamForAccount(account) {
  if (account.role === "teamManager" && teamById(account.scopeId)) return account.scopeId;
  if (["labDirector", "plr", "platformLead"].includes(account.role)) {
    const unit = state.org.units.find((item) => item.id === account.scopeId);
    return unit?.teams[0]?.id || allTeams()[0]?.id || "";
  }
  return allTeams()[0]?.id || "";
}

function syncAccountPerson(account) {
  syncAccountPersonForState(state, account);
}

function syncAccountPersonForState(targetState, account) {
  if (!["labDirector", "plr", "platformLead", "teamManager", "hrbp"].includes(account.role)) return;
  const allTargetTeams = targetState.org.units.flatMap((unit) => unit.teams.map((team) => ({ ...team, unitId: unit.id })));
  const teamId = account.role === "hrbp"
    ? ensurePeopleOperationsTeam(targetState)
    : account.role === "teamManager" && allTargetTeams.some((team) => team.id === account.scopeId)
    ? account.scopeId
    : ["labDirector", "plr", "platformLead"].includes(account.role)
      ? targetState.org.units.find((item) => item.id === account.scopeId)?.teams[0]?.id || allTargetTeams[0]?.id || ""
      : allTargetTeams[0]?.id || "";
  if (!teamId) return;
  const existing = targetState.people.find((person) => person.accountId === account.id || person.name.toLowerCase() === account.name.toLowerCase());
  const roleName = roleLabel(account.role);
  if (existing) {
    targetState.people = targetState.people.map((person) =>
      person.id === existing.id
        ? { ...person, accountId: account.id, name: account.name, role: roleName, teamId: person.teamId || teamId, level: leadershipLevelForRole(account.role) }
        : person,
    );
    return;
  }
  const usedEmployeeNos = new Set(targetState.people.map((person) => String(person.employeeNo || "")));
  targetState.people.push({
    id: `p-account-${account.id}`,
    accountId: account.id,
    employeeNo: nextFormattedEmployeeNo("Employee", usedEmployeeNos, targetState.people.length),
    name: account.name,
    teamId,
    role: roleName,
    level: leadershipLevelForRole(account.role),
    contractType: "Employee",
    startDate: today(),
    notes: "Created from Leadership & Access account.",
    talentTags: [],
    awards: [],
    growth: [],
    records: [],
  });
}

function saveProfileManager() {
  if (!isOwner()) return;
  const person = state.people.find((item) => item.id === activePersonId);
  if (!confirmAction(t("confirmManager"))) return;
  assignTeamManager(person.teamId, elements.profileManager.value);
  saveAndRender();
  renderProfile();
}

function addManagerRecord() {
  const person = state.people.find((item) => item.id === activePersonId);
  if (!person || !canAddManagerRecord(person)) return;
  const type = elements.managerRecordType.value;
  const content = elements.managerRecordContent.value.trim();
  if (!content) return;
  if (!confirmAction(t("addRecord"))) return;
  const record = { id: `r-${crypto.randomUUID()}`, type, date: elements.managerRecordDate.value || today(), authorId: state.sessionAccountId, content };
  person.records = [...(person.records || []), record];
  elements.managerRecordContent.value = "";
  elements.managerRecordEditor.open = false;
  saveAndRender();
  renderProfile();
}

function addTalentInsight() {
  const person = state.people.find((item) => item.id === activePersonId);
  if (!person || !canAddTalentInsight(person)) return;
  const type = elements.talentInsightType.value;
  const content = elements.talentInsightContent.value.trim();
  if (!content) return;
  if (!confirmAction(t("addRecord"))) return;
  const record = { id: `r-${crypto.randomUUID()}`, type, date: elements.talentInsightDate.value || today(), authorId: state.sessionAccountId, content };
  person.records = [...(person.records || []), record];
  elements.talentInsightContent.value = "";
  elements.talentInsightEditor.open = false;
  saveAndRender();
  renderProfile();
}

function addPersonTag() {
  const person = state.people.find((item) => item.id === activePersonId);
  if (!person || !canEditTalentProfile(person) || !elements.talentTagSelect.value) return;
  if (!confirmAction(t("confirmPersonTag", { name: `${person.employeeNo} ${person.name}` }))) return;
  person.talentTags = [...new Set([...(person.talentTags || []), elements.talentTagSelect.value])];
  saveAndRender();
  renderProfile();
}

function removePersonTag(tag) {
  const person = state.people.find((item) => item.id === activePersonId);
  if (!person || !canEditTalentProfile(person)) return;
  if (!confirmAction(`${t("delete")} ${tag}`)) return;
  person.talentTags = (person.talentTags || []).filter((item) => item !== tag);
  saveAndRender();
  renderProfile();
}

function addAward() {
  const person = state.people.find((item) => item.id === activePersonId);
  if (!person || !canEditTalentProfile(person) || !elements.awardNameSelect.value) return;
  if (!confirmAction(t("confirmAward", { name: `${person.employeeNo} ${person.name}` }))) return;
  person.awards = [...(person.awards || []), {
    id: `award-${crypto.randomUUID()}`,
    name: elements.awardNameSelect.value,
    date: elements.awardDate.value || today(),
    note: elements.awardNote.value.trim(),
  }];
  elements.awardNote.value = "";
  saveAndRender();
  renderProfile();
}

function removeAward(awardId) {
  const person = state.people.find((item) => item.id === activePersonId);
  if (!person || !canEditTalentProfile(person)) return;
  const award = (person.awards || []).find((item) => item.id === awardId);
  if (!confirmAction(`${t("delete")} ${award?.name || ""}`)) return;
  person.awards = (person.awards || []).filter((item) => item.id !== awardId);
  saveAndRender();
  renderProfile();
}

function addGrowth() {
  const person = state.people.find((item) => item.id === activePersonId);
  if (!person || !canEditTalentProfile(person) || !elements.growthNote.value.trim()) return;
  if (!confirmAction(t("confirmGrowth", { name: `${person.employeeNo} ${person.name}` }))) return;
  person.growth = [...(person.growth || []), {
    id: `growth-${crypto.randomUUID()}`,
    type: elements.growthType.value,
    date: elements.growthDate.value || today(),
    note: elements.growthNote.value.trim(),
  }];
  elements.growthNote.value = "";
  saveAndRender();
  renderProfile();
}

function addUnit() {
  if (!isOwner()) return;
  const type = elements.newUnitType.value;
  const name = elements.newUnitName.value.trim();
  if (!name) {
    showValidation("validationRequired");
    return;
  }
  if (!confirmAction(t("confirmAddUnit", { name }))) return;
  const unitId = `${type}-${crypto.randomUUID()}`;
  state.org.units.push({
    id: unitId,
    type,
    name,
    directorAccountId: "",
    plrAccountId: "",
    teams: type === "researchTeam" ? [{ id: `team-${crypto.randomUUID()}`, name, managerAccountId: "", primary: true }] : [],
  });
  elements.newUnitName.value = "";
  syncNewUnitNameField();
  saveAndRender();
}

function addOrgTeam() {
  if (!isOwner()) return;
  const unitId = elements.newTeamUnit.value;
  const name = elements.newTeamName.value.trim();
  const unit = state.org.units.find((item) => item.id === unitId);
  if (!unitId || !name) {
    showValidation("validationRequired");
    return;
  }
  if (!canAddChildTeam(unit)) {
    alert(t("noTeamsUnderStandalone"));
    return;
  }
  if (!confirmAction(t("confirmAddTeam", { name }))) return;
  state.org.units = state.org.units.map((unit) =>
    unit.id === unitId
      ? { ...unit, teams: [...unit.teams, { id: `team-${crypto.randomUUID()}`, name, managerAccountId: "" }] }
      : unit,
  );
  elements.newTeamName.value = "";
  saveAndRender();
}

function renameUnit(unitId) {
  if (!isOwner()) return;
  const input = elements.orgEditList.querySelector(`[data-unit-name="${unitId}"]`);
  const name = input?.value.trim();
  if (!name) {
    showValidation("validationRequired");
    return;
  }
  const unit = state.org.units.find((item) => item.id === unitId);
  if (!unit || unit.name === name) return;
  if (!confirmAction(`${unit.name} -> ${name}`)) {
    input.value = unit.name;
    return;
  }
  state.org.units = state.org.units.map((item) => item.id === unitId
    ? {
      ...item,
      name,
      teams: item.type === "researchTeam" ? item.teams.map((team) => team.primary ? { ...team, name } : team) : item.teams,
    }
    : item);
  saveAndRender();
}

function renameTeam(teamId) {
  if (!isOwner()) return;
  const input = elements.orgEditList.querySelector(`[data-team-name="${teamId}"]`);
  const name = input?.value.trim();
  if (!name) {
    showValidation("validationRequired");
    return;
  }
  const team = teamById(teamId);
  if (!team || team.name === name) return;
  if (!confirmAction(`${team.name} -> ${name}`)) {
    input.value = team.name;
    return;
  }
  state.org.units = state.org.units.map((unit) => ({
    ...unit,
    teams: unit.teams.map((item) => item.id === teamId ? { ...item, name } : item),
  }));
  saveAndRender();
}

function movePeople(personIds) {
  if (!isOwner()) return;
  const sourceTeamId = elements.moveSourceTeam.value;
  const targetTeamId = elements.moveTargetTeam.value;
  if (!sourceTeamId || !targetTeamId || sourceTeamId === targetTeamId || !personIds.length) {
    showValidation("validationRequired");
    return;
  }
  const targetTeam = teamById(targetTeamId);
  if (!confirmAction(t("confirmMovePeople", { count: personIds.length, team: targetTeam?.name || targetTeamId }))) return;
  const personIdSet = new Set(personIds);
  state.people = state.people.map((person) => personIdSet.has(person.id) ? { ...person, teamId: targetTeamId } : person);
  if (state.selectedTeamId === sourceTeamId) state.selectedTeamId = targetTeamId;
  const targetUnit = unitByTeam(targetTeamId);
  if (state.selectedUnitId !== "all" && state.selectedUnitId !== targetUnit?.id) state.selectedUnitId = "all";
  if (state.selectedOverviewTeamId === sourceTeamId) state.selectedOverviewTeamId = targetTeamId;
  saveAndRender();
}

function moveSelectedPeople() {
  const personIds = [...elements.movePeopleList.querySelectorAll("[data-move-person]:checked")].map((input) => input.dataset.movePerson);
  movePeople(personIds);
}

function moveAllPeople() {
  const sourceTeamId = elements.moveSourceTeam.value;
  movePeople(state.people.filter((person) => person.teamId === sourceTeamId).map((person) => person.id));
}

function deleteTeam(teamId) {
  if (!isOwner()) return;
  const unit = unitByTeam(teamId);
  const team = teamById(teamId);
  if (unit?.type === "researchTeam" && team?.primary) {
    deleteUnit(unit.id);
    return;
  }
  if (state.people.some((person) => person.teamId === teamId)) {
    alert(t("cannotDeleteTeam"));
    return;
  }
  if (!confirmAction(t("confirmDeleteTeam", { name: team?.name || teamId }))) return;
  state.org.units = state.org.units.map((unit) => ({ ...unit, teams: unit.teams.filter((team) => team.id !== teamId) }));
  if (state.selectedTeamId === teamId) state.selectedTeamId = "all";
  if (state.selectedUnitId !== "all" && !visibleTeams().some((team) => team.unitId === state.selectedUnitId)) state.selectedUnitId = "all";
  if (state.selectedOverviewTeamId === teamId) state.selectedOverviewTeamId = visibleTeams()[0]?.id || "all";
  pruneDeletedOrgReferences();
  saveAndRender();
}

function deleteUnit(unitId) {
  if (!isOwner()) return;
  const unit = state.org.units.find((item) => item.id === unitId);
  const hasPeople = unit?.teams.some((team) => state.people.some((person) => person.teamId === team.id));
  if (hasPeople) {
    alert(t("cannotDeleteTeam"));
    return;
  }
  if (unit?.teams.length && unit.type !== "researchTeam") {
    alert(t("cannotDeleteUnit"));
    return;
  }
  if (!confirmAction(t("confirmDeleteUnit", { name: unit?.name || unitId }))) return;
  state.org.units = state.org.units.filter((item) => item.id !== unitId);
  if (state.selectedUnitId === unitId) state.selectedUnitId = "all";
  if (state.selectedTalentUnitId === unitId) state.selectedTalentUnitId = "all";
  pruneDeletedOrgReferences();
  saveAndRender();
}

function addTalentTag() {
  if (!isOwner()) return;
  const name = elements.newTalentTag.value.trim();
  if (!name) {
    showValidation("validationRequired");
    return;
  }
  if (!confirmAction(t("confirmTag", { name }))) return;
  state.talentTags = [...new Set([...state.talentTags, name])];
  elements.newTalentTag.value = "";
  saveAndRender();
}

function addAwardName() {
  if (!isOwner()) return;
  const name = elements.newAwardName.value.trim();
  if (!name) {
    showValidation("validationRequired");
    return;
  }
  if (!confirmAction(t("confirmAwardName", { name }))) return;
  state.awardNames = [...new Set([...state.awardNames, name])];
  elements.newAwardName.value = "";
  saveAndRender();
}

function configArrayByType(type) {
  return type === "action" ? state.talentActionTypes : state.cultureActivityTypes;
}

function setConfigArrayByType(type, values) {
  if (type === "action") state.talentActionTypes = values;
  else state.cultureActivityTypes = values;
}

function addConfigType(type) {
  if (!isOwner()) return;
  const input = type === "action" ? elements.newActionType : elements.newActivityType;
  const name = input.value.trim();
  if (!name) {
    showValidation("validationRequired");
    return;
  }
  const confirmKey = type === "action" ? "confirmActionType" : "confirmActivityType";
  if (!confirmAction(t(confirmKey, { name }))) return;
  setConfigArrayByType(type, [...new Set([...configArrayByType(type), name])]);
  input.value = "";
  saveAndRender();
}

function parseTypeToken(token) {
  const [type, ...rest] = String(token || "").split(":");
  return { type, oldValue: rest.join(":") };
}

function saveConfigType(token) {
  if (!isOwner()) return;
  const { type, oldValue } = parseTypeToken(token);
  const input = [...elements.developmentSettingList.querySelectorAll("[data-type-value]")]
    .find((node) => node.dataset.typeValue === token);
  const nextValue = input?.value.trim();
  if (!nextValue) {
    showValidation("validationRequired");
    return;
  }
  if (!confirmAction(`${t("save")} ${nextValue}`)) return;
  setConfigArrayByType(type, configArrayByType(type).map((item) => item === oldValue ? nextValue : item));
  if (type === "action") {
    state.talentActions = state.talentActions.map((action) => action.type === oldValue ? { ...action, type: nextValue } : action);
  } else {
    state.cultureActivities = state.cultureActivities.map((activity) => activity.type === oldValue ? { ...activity, type: nextValue } : activity);
  }
  saveAndRender();
}

function deleteConfigType(token) {
  if (!isOwner()) return;
  const { type, oldValue } = parseTypeToken(token);
  if (configArrayByType(type).length <= 1) {
    alert(t("cannotDeleteLastType"));
    return;
  }
  if (!confirmAction(`${t("delete")} ${oldValue}`)) return;
  setConfigArrayByType(type, configArrayByType(type).filter((item) => item !== oldValue));
  saveAndRender();
}

function addGoal() {
  if (!canEditTalentOrg()) return;
  const scope = elements.goalScopeSelect.value;
  const year = elements.goalYear.value || new Date().getFullYear();
  const mainWork = elements.mainWorkInput.value.trim();
  const mainGoals = elements.mainGoalsInput.value.trim();
  if (!scope || !mainWork || !mainGoals) {
    showValidation("validationRequired");
    return;
  }
  if (!confirmAction(t("confirmGoal", { scope: scopeLabelByValue(scope) }))) return;
  state.orgGoals.unshift({ id: `goal-${crypto.randomUUID()}`, scope, year, mainWork, mainGoals, authorId: state.sessionAccountId, createdAt: today() });
  elements.mainWorkInput.value = "";
  elements.mainGoalsInput.value = "";
  saveAndRender();
}

function addActivity() {
  if (!canEditTalentOrg()) return;
  const scope = elements.activityScopeSelect.value;
  const summary = elements.activitySummary.value.trim();
  if (!scope || !summary) {
    showValidation("validationRequired");
    return;
  }
  if (!confirmAction(t("confirmActivity", { scope: scopeLabelByValue(scope) }))) return;
  state.cultureActivities.unshift({
    id: `activity-${crypto.randomUUID()}`,
    scope,
    type: elements.activityType.value,
    date: elements.activityDate.value || today(),
    participants: Number(elements.activityParticipants.value || 0),
    summary,
    authorId: state.sessionAccountId,
    createdAt: today(),
  });
  elements.activitySummary.value = "";
  elements.activityParticipants.value = "";
  saveAndRender();
}

function addTalentAction() {
  if (!canEditTalentOrg()) return;
  const personIds = [...elements.talentActionPerson.selectedOptions].map((option) => option.value);
  const people = personIds.map((id) => state.people.find((item) => item.id === id)).filter(Boolean);
  const note = elements.talentActionNote.value.trim();
  if (!people.length || !note) {
    showValidation("validationRequired");
    return;
  }
  if (!people.every((person) => canAddTalentActionForPerson(person))) return;
  if (editingTalentActionId) {
    const action = state.talentActions.find((item) => item.id === editingTalentActionId);
    const person = people[0];
    if (!action || !person) return;
    if (!confirmAction(t("updateTalentAction"))) return;
    state.talentActions = state.talentActions.map((item) => item.id === editingTalentActionId ? {
      ...item,
      personId: person.id,
      type: elements.talentActionType.value,
      priority: elements.talentActionPriority.value,
      status: elements.talentActionStatus.value,
      dueDate: elements.talentActionDueDate.value || today(),
      note,
      updatedAt: today(),
    } : item);
    editingTalentActionId = "";
    elements.addTalentActionBtn.textContent = t("addTalentAction");
    elements.talentActionNote.value = "";
    saveAndRender();
    return;
  }
  const confirmText = people.length === 1
    ? t("confirmTalentAction", { name: `${people[0].employeeNo} ${people[0].name}` })
    : t("confirmTalentActions", { count: people.length });
  if (!confirmAction(confirmText)) return;
  const actionTemplate = {
    type: elements.talentActionType.value,
    priority: elements.talentActionPriority.value,
    status: elements.talentActionStatus.value,
    dueDate: elements.talentActionDueDate.value || today(),
    note,
    authorId: state.sessionAccountId,
    createdAt: today(),
  };
  state.talentActions.unshift(...people.map((person) => ({
    id: `talent-action-${crypto.randomUUID()}`,
    personId: person.id,
    ...actionTemplate,
  })));
  elements.talentActionNote.value = "";
  saveAndRender();
}

function addProfileTalentAction() {
  const person = state.people.find((item) => item.id === activePersonId);
  if (!person || !canAddTalentActionForPerson(person)) return;
  const note = elements.profileTalentActionNote.value.trim();
  if (!note) {
    showValidation("validationRequired");
    return;
  }
  if (!confirmAction(t("confirmTalentAction", { name: `${person.employeeNo} ${person.name}` }))) return;
  state.talentActions.unshift({
    id: `talent-action-${crypto.randomUUID()}`,
    personId: person.id,
    type: elements.profileTalentActionType.value,
    priority: elements.profileTalentActionPriority.value,
    status: elements.profileTalentActionStatus.value,
    dueDate: elements.profileTalentActionDueDate.value || today(),
    note,
    authorId: state.sessionAccountId,
    createdAt: today(),
  });
  elements.profileTalentActionNote.value = "";
  elements.profileTalentActionEditor.open = false;
  saveAndRender();
  renderProfile();
}

function bindTalentActionButtons(container = elements.talentActionList) {
  container.querySelectorAll("[data-edit-talent-action]").forEach((button) => {
    button.addEventListener("click", () => editTalentAction(button.dataset.editTalentAction));
  });
  container.querySelectorAll("[data-archive-talent-action]").forEach((button) => {
    button.addEventListener("click", () => archiveTalentAction(button.dataset.archiveTalentAction));
  });
  container.querySelectorAll("[data-delete-talent-action]").forEach((button) => {
    button.addEventListener("click", () => deleteTalentAction(button.dataset.deleteTalentAction));
  });
}

function editTalentAction(actionId) {
  const action = state.talentActions.find((item) => item.id === actionId);
  const person = action ? state.people.find((item) => item.id === action.personId) : null;
  if (!action || !person || !canAddTalentActionForPerson(person)) return;
  editingTalentActionId = actionId;
  state.activePage = "talentDevelopmentPage";
  elements.profileDialog.close();
  renderActivePage();
  renderTalentDevelopment();
  const actionPanel = elements.talentActionPerson.closest("details");
  if (actionPanel) actionPanel.open = true;
  elements.talentActionType.value = action.type;
  elements.talentActionPriority.value = action.priority;
  elements.talentActionStatus.value = action.status;
  elements.talentActionDueDate.value = action.dueDate || today();
  elements.talentActionNote.value = action.note || "";
  [...elements.talentActionPerson.options].forEach((option) => {
    option.selected = option.value === action.personId;
  });
  elements.addTalentActionBtn.textContent = t("updateTalentAction");
}

function archiveTalentAction(actionId) {
  const action = state.talentActions.find((item) => item.id === actionId);
  const person = action ? state.people.find((item) => item.id === action.personId) : null;
  if (!action || !person || !canAddTalentActionForPerson(person) || !confirmAction(`${t("archive")} ${action.type}`)) return;
  state.talentActions = state.talentActions.map((item) => item.id === actionId ? { ...item, archived: true, archivedAt: today() } : item);
  saveAndRender();
}

function deleteTalentAction(actionId) {
  const action = state.talentActions.find((item) => item.id === actionId);
  const person = action ? state.people.find((item) => item.id === action.personId) : null;
  if (!action || !person || !canAddTalentActionForPerson(person) || !confirmAction(`${t("delete")} ${action.type}`)) return;
  state.talentActions = state.talentActions.filter((item) => item.id !== actionId);
  if (editingTalentActionId === actionId) editingTalentActionId = "";
  saveAndRender();
}

function addAccount() {
  if (!isOwner()) return;
  const role = elements.newAccountRole.value;
  const scopeIds = [];
  const scopeId = role === "hrbp" ? "teams" : elements.newAccountScope.value;
  const scopeType = role === "researchDirector" ? "center" : ["teamManager", "hrbp"].includes(role) ? "team" : "unit";
  const name = elements.newAccountName.value.trim();
  const email = elements.newAccountEmail.value.trim().toLowerCase();
  const password = elements.newAccountPassword.value;
  if (!name || !email || !password || !scopeId) {
    showValidation("validationRequired");
    return;
  }
  if (state.accounts.some((account) => account.email.toLowerCase() === email)) {
    showValidation("duplicateEmail");
    return;
  }
  if (!confirmAction(t("confirmAddAccount", { email }))) return;
  const account = {
    id: `${role}-${crypto.randomUUID()}`,
    name,
    email,
    password,
    role,
    scopeType,
    scopeId,
    scopeIds: role === "hrbp" ? scopeIds : undefined,
  };
  state.accounts.push(account);
  applyLeadershipAssignment(account);
  syncAccountPerson(account);
  elements.newAccountName.value = "";
  elements.newAccountEmail.value = "";
  elements.newAccountPassword.value = "";
  saveAndRender();
  showToast(t("accountCreated"));
}

function addAccountFromPanel(kind, root) {
  if (!isOwner()) return;
  const role = root.querySelector(`[data-new-account-role="${kind}"]`)?.value;
  const scopeSelect = root.querySelector(`[data-new-account-scope="${kind}"]`);
  const selectedScopeIds = scopeSelect ? [...scopeSelect.selectedOptions].map((option) => option.value) : [];
  const scopeId = role === "hrbp" ? "teams" : scopeSelect?.value;
  const scopeType = role === "owner" || role === "researchDirector" ? "center" : ["teamManager", "hrbp"].includes(role) ? "team" : "unit";
  const nameInput = root.querySelector(`[data-new-account-name="${kind}"]`);
  const emailInput = root.querySelector(`[data-new-account-email="${kind}"]`);
  const passwordInput = root.querySelector(`[data-new-account-password="${kind}"]`);
  const name = nameInput?.value.trim();
  const email = emailInput?.value.trim().toLowerCase();
  const password = passwordInput?.value;
  if (!name || !email || !password || !role || !scopeId || (role === "hrbp" && !selectedScopeIds.length)) {
    showValidation("validationRequired");
    return;
  }
  if (state.accounts.some((account) => account.email.toLowerCase() === email)) {
    showValidation("duplicateEmail");
    return;
  }
  if (!confirmAction(t("confirmAddAccount", { email }))) return;
  const account = {
    id: `${role}-${crypto.randomUUID()}`,
    name,
    email,
    password,
    role,
    scopeType,
    scopeId,
    scopeIds: role === "hrbp" ? selectedScopeIds : undefined,
  };
  state.accounts.push(account);
  applyLeadershipAssignment(account);
  syncAccountPerson(account);
  nameInput.value = "";
  emailInput.value = "";
  passwordInput.value = "";
  saveAndRender();
  showToast(t("accountCreated"));
}

function saveAccountEdit(accountId, root = document) {
  if (!isOwner()) return;
  const account = state.accounts.find((item) => item.id === accountId);
  if (!account) return;
  const name = root.querySelector(`[data-account-name="${accountId}"]`)?.value.trim();
  const email = root.querySelector(`[data-account-email="${accountId}"]`)?.value.trim().toLowerCase();
  const role = root.querySelector(`[data-account-role="${accountId}"]`)?.value;
  const scopeSelect = root.querySelector(`[data-account-scope="${accountId}"]`);
  const scopeIds = role === "hrbp" ? accountScopeIds(account) : [];
  const scopeId = role === "hrbp" ? "teams" : scopeSelect?.value;
  if (!name || !email || !role || !scopeId) {
    showValidation("validationRequired");
    return;
  }
  if (state.accounts.some((item) => item.id !== accountId && item.email.toLowerCase() === email)) {
    showValidation("duplicateEmail");
    return;
  }
  if (account.role === "owner" && role !== "owner" && state.accounts.filter((item) => item.role === "owner").length <= 1) {
    alert(t("cannotDeleteLastOwner"));
    return;
  }
  if (!confirmAction(t("confirmEditAccount", { email }))) return;
  const scopeType = role === "owner" || role === "researchDirector" ? "center" : ["teamManager", "hrbp"].includes(role) ? "team" : "unit";
  clearLeadershipRefs(accountId);
  const updatedAccount = { ...account, name, email, role, scopeType, scopeId, scopeIds: role === "hrbp" ? scopeIds : undefined };
  state.accounts = state.accounts.map((item) => item.id === accountId ? updatedAccount : item);
  applyLeadershipAssignment(updatedAccount);
  syncAccountPerson(updatedAccount);
  if (state.sessionAccountId === accountId && role !== "owner") {
    state.ownerViewScope = { type: "center", id: "center-1" };
  }
  saveAndRender();
  showToast(t("accountSaved"));
}

function saveHrbpTeams(accountId) {
  if (!isOwner()) return;
  const select = elements.hrbpAssignmentList.querySelector(`[data-hrbp-teams="${accountId}"]`);
  const selectedIds = [...select.selectedOptions].map((option) => option.value);
  const account = state.accounts.find((item) => item.id === accountId);
  if (!account) return;
  if (!confirmAction(`${t("saveHrbpPeople")} · ${account.name}`)) return;
  state.accounts = state.accounts.map((item) => item.id === accountId ? { ...item, scopeType: "team", scopeId: "teams", scopeIds: selectedIds } : item);
  saveAndRender();
  showToast(t("hrbpTeamsSaved"));
}

function isAccountReferenced(accountId) {
  if (state.org.center.directorAccountId === accountId) return true;
  return state.org.units.some(
    (unit) =>
      unit.directorAccountId === accountId ||
      unit.plrAccountId === accountId ||
      unit.teams.some((team) => team.managerAccountId === accountId),
  );
}

function deleteAccount(accountId) {
  if (!isOwner()) return;
  const account = state.accounts.find((item) => item.id === accountId);
  if (!account) return;
  if (account.id === state.sessionAccountId) {
    alert(t("cannotDeleteCurrent"));
    return;
  }
  if (account.role === "owner" && state.accounts.filter((item) => item.role === "owner").length <= 1) {
    alert(t("cannotDeleteLastOwner"));
    return;
  }
  if (isAccountReferenced(account.id)) {
    alert(t("accountInUse"));
    return;
  }
  if (!confirmAction(t("confirmDeleteAccount", { email: account.email }))) return;
  state.accounts = state.accounts.filter((item) => item.id !== account.id);
  saveAndRender();
  showToast(t("accountDeleted"));
}

async function changeOwnPassword() {
  const account = currentAccount();
  if (!account) return;
  const currentPassword = elements.currentPasswordInput.value;
  const newPassword = elements.newPasswordInput.value;
  const confirmPassword = elements.confirmPasswordInput.value;
  if (!currentPassword || !newPassword || !confirmPassword) {
    showValidation("validationRequired");
    return;
  }
  const useRemotePassword = remoteAuthMatchesCurrentAccount();
  if (!useRemotePassword && currentPassword !== account.password) {
    showValidation("currentPasswordWrong");
    return;
  }
  if (newPassword.length < 6) {
    showValidation("passwordTooShort");
    return;
  }
  if (newPassword !== confirmPassword) {
    showValidation("passwordMismatch");
    return;
  }
  if (!confirmAction(t("confirmPasswordChange"))) return;
  if (useRemotePassword) {
    const { error: verifyError } = await supabaseClient.auth.signInWithPassword({ email: account.email, password: currentPassword });
    if (verifyError) {
      showValidation("currentPasswordWrong");
      return;
    }
    const { error: updateError } = await supabaseClient.auth.updateUser({ password: newPassword });
    if (updateError) {
      alert(updateError.message || t("remoteSaveFailed"));
      return;
    }
  }
  state.accounts = state.accounts.map((item) => item.id === account.id ? { ...item, password: newPassword } : item);
  elements.currentPasswordInput.value = "";
  elements.newPasswordInput.value = "";
  elements.confirmPasswordInput.value = "";
  saveAndRender();
  showToast(t("passwordSaved"));
}

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(elements.loginForm);
  const email = data.get("email").trim().toLowerCase();
  const password = String(data.get("password") || "").trim();
  elements.loginError.textContent = "";
  const loginButton = elements.loginForm.querySelector("button[type=\"submit\"]");
  if (loginButton) loginButton.disabled = true;
  try {
    const localAccount = localPasswordAccount(email, password);
    if (localAccount && defaultState.accounts.some((account) => account.email.toLowerCase() === email && account.password === password)) {
      await clearRemoteAuth();
      completeLogin(localAccount);
      return;
    }
    if (supabaseClient) {
      const { data: authData, error } = await withTimeout(supabaseClient.auth.signInWithPassword({ email, password }));
      if (error) {
        if (localAccount) {
          await clearRemoteAuth();
          completeLogin(localAccount);
          return;
        }
        elements.loginError.textContent = `${t("loginFailed")} ${error.message || ""}`.trim();
        return;
      }
      try {
        await withTimeout(loadRemoteState());
      } catch (remoteError) {
        console.error(remoteError);
        if (localAccount) {
          await clearRemoteAuth();
          completeLogin(localAccount);
          showToast(t("remoteLoadFailed"));
          return;
        }
        elements.loginError.textContent = t("remoteLoadFailed");
        return;
      }
      const account = accountByEmail(email) || createInitialOwnerAccount(email, authData?.user?.user_metadata?.full_name);
      if (!account) {
        await clearRemoteAuth();
        elements.loginError.textContent = t("loginNoRole");
        return;
      }
      remoteAuthEmail = email;
      completeLogin(account);
      await saveRemoteStateNow();
      return;
    }
    if (!localAccount) {
      elements.loginError.textContent = t("loginFailed");
      return;
    }
    await clearRemoteAuth();
    completeLogin(localAccount);
  } catch (error) {
    console.error(error);
    elements.loginError.textContent = t("loginServiceUnavailable");
  } finally {
    if (loginButton) loginButton.disabled = false;
  }
});

elements.logoutBtn.addEventListener("click", async () => {
  state.sessionAccountId = "";
  await clearRemoteAuth();
  saveAndRender();
});
elements.changePasswordBtn.addEventListener("click", changeOwnPassword);
elements.languageSwitcher.addEventListener("change", (event) => { state.language = event.target.value; saveAndRender(); });
elements.loginLanguageSwitcher.addEventListener("change", (event) => { state.language = event.target.value; saveAndRender(); });
elements.settingsBtn.addEventListener("click", () => {
  if (currentAccount()) elements.settingsDialog.showModal();
});
elements.closeSettingsBtn.addEventListener("click", () => elements.settingsDialog.close());
elements.pageTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.activePage = tab.dataset.pageTarget;
    saveAndRender();
  });
});
elements.instituteName.addEventListener("focus", () => { elements.instituteName.dataset.previous = state.org.center.name; });
elements.instituteName.addEventListener("change", (event) => {
  if (!isOwner()) return;
  const nextName = event.target.value.trim();
  if (!nextName) {
    showValidation("validationRequired");
    elements.instituteName.value = elements.instituteName.dataset.previous || state.org.center.name;
    return;
  }
  if (!confirmAction(`${t("mainInstitute")} -> ${nextName}`)) {
    elements.instituteName.value = elements.instituteName.dataset.previous || state.org.center.name;
    return;
  }
  state.org.center.name = nextName;
  saveAndRender();
});
elements.searchInput.addEventListener("input", (event) => { state.searchText = event.target.value; state.peopleDisplayLimit = 24; saveAndRender(); });
elements.labList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-unit-id]");
  if (!button) return;
  state.selectedUnitId = button.dataset.unitId;
  state.selectedTeamId = "all";
  state.peopleDisplayLimit = 24;
  saveAndRender();
});
elements.teamList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-team-id]");
  if (!button) return;
  state.selectedTeamId = button.dataset.teamId;
  state.peopleDisplayLimit = 24;
  saveAndRender();
});
elements.talentUnitFilter.addEventListener("change", (event) => {
  state.selectedTalentUnitId = event.target.value;
  state.selectedTalentTeamId = "all";
  saveAndRender();
});
elements.talentTeamFilter.addEventListener("change", (event) => {
  state.selectedTalentTeamId = event.target.value;
  saveAndRender();
});
elements.employeeImportFile.addEventListener("change", () => {
  const file = elements.employeeImportFile.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    elements.employeeImportText.value = String(reader.result || "");
    elements.employeeImportResult.textContent = "";
  });
  reader.readAsText(file);
});
elements.importEmployeesBtn.addEventListener("click", importEmployeesFromText);
elements.downloadImportTemplateBtn.addEventListener("click", downloadImportTemplate);
elements.clearImportBtn.addEventListener("click", () => {
  elements.employeeImportFile.value = "";
  elements.employeeImportText.value = "";
  elements.employeeImportResult.textContent = "";
});
elements.newAccountRole.addEventListener("change", renderScopeOptions);
elements.addManagerBtn.addEventListener("click", addAccount);
elements.newUnitType.addEventListener("change", syncNewUnitNameField);
elements.addUnitBtn.addEventListener("click", addUnit);
elements.addOrgTeamBtn.addEventListener("click", addOrgTeam);
elements.moveSourceTeam.addEventListener("change", renderMovePeopleList);
elements.moveSelectedPeopleBtn.addEventListener("click", moveSelectedPeople);
elements.moveAllPeopleBtn.addEventListener("click", moveAllPeople);
elements.bulkArchiveEmployeesBtn.addEventListener("click", archiveSelectedEmployees);
elements.downloadFormerEmployeesBtn.addEventListener("click", downloadFormerEmployeesArchive);
elements.addTalentTagBtn.addEventListener("click", addTalentTag);
elements.addAwardNameBtn.addEventListener("click", addAwardName);
elements.addActionTypeBtn.addEventListener("click", () => addConfigType("action"));
elements.addActivityTypeBtn.addEventListener("click", () => addConfigType("activity"));
elements.addGoalBtn.addEventListener("click", addGoal);
elements.addActivityBtn.addEventListener("click", addActivity);
elements.addTalentActionBtn.addEventListener("click", addTalentAction);
elements.showAddPersonBtn.addEventListener("click", () => { if (canAddDeleteEmployees()) elements.personDialog.showModal(); });
elements.showDeletePersonBtn.addEventListener("click", openDeleteEmployeeDialog);
elements.closeDialogBtn.addEventListener("click", () => elements.personDialog.close());
elements.cancelPersonBtn.addEventListener("click", () => elements.personDialog.close());
elements.personForm.addEventListener("submit", addPerson);
elements.closeDeleteEmployeeBtn.addEventListener("click", () => elements.deleteEmployeeDialog.close());
elements.cancelDeleteEmployeeBtn.addEventListener("click", () => elements.deleteEmployeeDialog.close());
elements.deleteEmployeeForm.addEventListener("submit", archiveEmployee);
elements.closeProfileBtn.addEventListener("click", () => elements.profileDialog.close());
elements.saveProfileManagerBtn.addEventListener("click", saveProfileManager);
elements.editBasicInfoBtn.addEventListener("click", () => {
  if (!canAddDeleteEmployees()) return;
  editingBasicInfo = true;
  renderProfile();
});
elements.profileBasics.addEventListener("click", (event) => {
  if (event.target.closest("#saveBasicInfoBtn")) saveBasicInfo();
  if (event.target.closest("#cancelBasicInfoBtn")) {
    editingBasicInfo = false;
    renderProfile();
  }
});
elements.addManagerRecordBtn.addEventListener("click", addManagerRecord);
elements.addTalentInsightBtn.addEventListener("click", addTalentInsight);
elements.addProfileTalentActionBtn.addEventListener("click", addProfileTalentAction);
elements.addPersonTagBtn.addEventListener("click", addPersonTag);
elements.addAwardBtn.addEventListener("click", addAward);
elements.addGrowthBtn.addEventListener("click", addGrowth);

async function initializeApp() {
  if (supabaseClient) {
    const { data } = await withTimeout(supabaseClient.auth.getSession()).catch((error) => {
      console.error(error);
      return { data: null };
    });
    const email = data?.session?.user?.email?.toLowerCase();
    if (email) {
      try {
        await withTimeout(loadRemoteState());
        const account = accountByEmail(email);
        if (account) {
          remoteAuthEmail = email;
          state.sessionAccountId = account.id;
        } else {
          await clearRemoteAuth();
        }
      } catch (error) {
        console.error(error);
        await clearRemoteAuth();
        elements.loginError.textContent = t("remoteLoadFailed");
      }
    }
  }
  saveState();
  render();
}

initializeApp();
