export interface InformationalPageContent {
  title: string;
  introduction: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
  note: string;
}

const NOTE =
  "This page is provided for informational and historical reference only.";

function chartContent(
  title: string,
  introduction: string,
  sections: Array<[heading: string, body: string]>,
): InformationalPageContent {
  return {
    title,
    introduction,
    sections: sections.map(([heading, body]) => ({ heading, body })),
    note: NOTE,
  };
}

export const CHART_PAGE_CONTENT: Record<string, InformationalPageContent> = {
  "akash-ganga": chartContent(
    "Akash Ganga Chart – Historical Chart Information",
    "The Akash Ganga chart page is created for visitors who want to review information related to the Akash Ganga chart in a simple and organized format. The page brings the available chart records together so that visitors do not have to search through unrelated pages to find the information they are looking for.",
    [
      ["Akash Ganga Chart Information", "A chart can be useful as a historical reference when it is presented clearly and with proper context. On this page, the available Akash Ganga records are organized in an easy-to-read format. Visitors can review the information according to the dates and entries shown on the chart."],
      ["How This Chart Page Is Organized", "The chart is kept separate from general articles and other result pages. This makes it easier to find historical information without mixing it with unrelated content. The page may be updated when new records or corrections are available."],
      ["Akash Ganga Historical Records", "Historical chart information should be treated only as reference material. Previous records do not provide a reliable way to determine future outcomes. Our aim is to keep the information presented on this page clear, readable and easy to review."],
    ],
  ),
  "bala-ji-dadri": chartContent(
    "Bala Ji Dadri Chart – Historical Information & Records",
    "The Bala Ji Dadri chart page provides a dedicated place to review available chart information and historical records. Instead of combining several different markets or topics on one page, this section focuses specifically on Bala Ji Dadri information.",
    [
      ["Bala Ji Dadri Chart Information", "Visitors can use this page to understand how the available historical chart records are arranged. Dates and corresponding entries are presented in a straightforward format, making the information easier to read on both desktop and mobile devices."],
      ["Why Historical Chart Records Matter", "Historical records can help visitors review previously published information and understand how a chart has been maintained over time. They should, however, be viewed as records of past information rather than predictions of future results."],
      ["About This Bala Ji Dadri Page", "This page is maintained separately so that visitors looking specifically for Bala Ji Dadri information can reach the relevant chart without going through unrelated content. When additional historical information becomes available, the page can be updated accordingly."],
    ],
  ),
  "bhagya-lakshmi": chartContent(
    "Bhagya Lakshmi Chart – Historical Records & Information",
    "The Bhagya Lakshmi chart page is designed for visitors who want to review available historical chart information in one place. The page focuses on presenting records clearly rather than filling the page with repeated keywords or unrelated information.",
    [
      ["Bhagya Lakshmi Chart Details", "Available entries are organized in a simple chart format so visitors can follow the information by date. Keeping the chart and supporting information together makes the page easier to navigate and helps users understand what type of historical information is being displayed."],
      ["Understanding Historical Chart Data", "Historical chart data represents information from earlier dates. It can be reviewed as a record of previously published information, but it should not be treated as a guarantee or prediction of what may happen in the future. Every entry on the page represents information associated with its particular date."],
      ["Bhagya Lakshmi Chart Page Updates", "This page can be updated when new records are added or when an existing entry needs correction. The goal is to keep the information useful, readable and clearly separated from other chart categories."],
    ],
  ),
  "choti-gali": chartContent(
    "Choti Gali Chart – Historical Information & Records",
    "The Choti Gali chart page provides a dedicated location for reviewing available historical chart information. Visitors can use the page to find Choti Gali records without having to search through multiple unrelated sections of the website.",
    [
      ["Choti Gali Chart Information", "The available records are presented in a clear and structured format. Dates and entries can be reviewed directly from the chart section, while the supporting information on this page explains the purpose of the historical data and how it is organized."],
      ["Reviewing Previous Chart Records", "Historical records are useful when someone wants to look back at information published for earlier dates. They should be understood as records of past information only and should not be considered a method for predicting future outcomes."],
      ["Keeping the Chart Easy to Use", "The Choti Gali page is kept focused on its specific topic. This helps visitors quickly understand what they are viewing and avoids unnecessary information that does not belong to this chart category."],
    ],
  ),
  "delhi-evening": chartContent(
    "Delhi Evening Chart – Historical Chart Information",
    "The Delhi Evening chart page provides a focused place for reviewing available historical information associated with the Delhi Evening chart. The page is intended to make the relevant records easier to find, read and understand.",
    [
      ["Delhi Evening Chart Details", "Chart entries are organized according to the information available for individual dates. Visitors can use the chart section to review historical entries while the supporting text explains the purpose and organization of the page."],
      ["Historical Delhi Evening Records", "Historical records represent information from previous dates. They can be useful for reviewing the history of a particular chart, but past records should not be interpreted as a reliable indication of future results."],
      ["About This Chart Page", "The Delhi Evening page is kept separate from other chart categories so visitors can reach the information they specifically searched for. The page may be revised when additional records become available or when existing information needs to be corrected."],
    ],
  ),
  desawar: chartContent(
    "Desawar Chart – Historical Records & Chart Information",
    "The Desawar chart page brings together available historical chart information in a dedicated section. It is intended for visitors who want to review Desawar-related records in an organized format rather than searching through general pages.",
    [
      ["Desawar Chart Information", "The chart section presents available entries according to their respective dates. A simple layout makes it easier to locate information and compare different historical entries without unnecessary distractions."],
      ["Understanding Desawar Historical Data", "Historical chart data represents information associated with earlier dates. It can be reviewed as a record of previously published information, but it should not be used as a guarantee, prediction or promise about future outcomes."],
      ["Desawar Chart Page Updates", "The page can be updated when new records are added or when corrections are required. Keeping the information focused on Desawar also helps visitors understand exactly what the page is intended to provide."],
    ],
  ),
  "ghaziabad-night": chartContent(
    "Ghaziabad Night Chart – Historical Records & Information",
    "The Ghaziabad Night chart page is a dedicated resource for visitors looking for historical chart information related to Ghaziabad Night. The page keeps the relevant information together in one place for easier browsing.",
    [
      ["Ghaziabad Night Chart Details", "Available chart records are arranged by date and presented in a straightforward format. This helps visitors review the information without having to move between several unrelated pages."],
      ["Historical Chart Information", "A historical chart is simply a record of information connected with earlier dates. Reviewing previous entries can provide historical context, but earlier information does not establish what a future entry will be."],
      ["Maintaining the Ghaziabad Night Page", "The page is designed to remain focused on Ghaziabad Night information. Updates can be made when relevant records are added or when corrections are necessary, helping keep the page clear and useful for returning visitors."],
    ],
  ),
  "gold-bazar": chartContent(
    "Gold Bazar Chart – Historical Information & Records",
    "The Gold Bazar chart page provides a dedicated section for reviewing available historical chart information. Visitors can use this page to find Gold Bazar records in an organized and readable format.",
    [
      ["Gold Bazar Chart Information", "The chart presents available historical entries according to their dates. The surrounding information explains what the page contains and helps visitors understand that the chart is primarily a record of previously available information."],
      ["Reviewing Gold Bazar History", "Historical records can be useful when reviewing information from earlier dates. However, past entries should remain historical references and should not be presented as predictions or guarantees about future outcomes."],
      ["About This Page", "The Gold Bazar chart is maintained separately from other categories to provide a cleaner browsing experience. When relevant information changes or new records are added, the page can be reviewed and updated."],
    ],
  ),
  jaisalmer: chartContent(
    "Jaisalmer Chart – Historical Chart Records & Information",
    "The Jaisalmer chart page is intended for visitors looking for historical information related specifically to the Jaisalmer chart. The page keeps the relevant records and supporting information together for easier access.",
    [
      ["Jaisalmer Chart Information", "Available records are displayed in an organized chart format. Visitors can review entries according to their dates and use the surrounding information to understand the purpose of the chart."],
      ["Using Historical Records for Reference", "Previous records provide historical information about earlier dates. They can be reviewed to understand what has already been recorded, but they should not be interpreted as a dependable way to determine future outcomes."],
      ["Jaisalmer Chart Updates", "The page can be updated whenever relevant historical information is added or an existing record requires correction. Keeping the page focused on Jaisalmer makes navigation simpler for visitors."],
    ],
  ),
  nepal: chartContent(
    "Nepal Chart – Historical Records & Information",
    "The Nepal chart page provides a dedicated location for reviewing available historical chart information. It is designed to keep Nepal-related records separate from other chart categories so visitors can find the information they need more easily.",
    [
      ["Nepal Chart Details", "The available entries are arranged according to dates and displayed in a straightforward format. This structure allows visitors to review historical information without unnecessary text or unrelated chart categories."],
      ["Understanding Historical Chart Entries", "Chart records describe information associated with previous dates. They may be useful for historical reference, but previous entries do not guarantee or predict what may happen at a later date."],
      ["About the Nepal Chart Page", "The page is maintained with a focus on clarity and usability. Relevant updates or corrections can be incorporated when necessary so that returning visitors can continue to find the information in one place."],
    ],
  ),
  "new-gali": chartContent(
    "New Gali Chart – Historical Chart Information & Records",
    "The New Gali chart page is designed for visitors who want to review available New Gali historical information. It provides a focused page where the relevant records can be viewed without mixing them with other chart categories.",
    [
      ["New Gali Chart Information", "Available chart entries are organized by date so visitors can review the historical information in a logical order. The chart section is supported by explanatory text rather than relying only on a table or list."],
      ["Why Historical Records Are Useful", "Historical records allow visitors to review information that was associated with earlier dates. These records are useful as references, but they should not be treated as forecasts, guarantees or instructions for future activity."],
      ["Keeping New Gali Information Updated", "This page can be reviewed when new historical entries are available or when corrections are needed. The aim is to maintain a simple, focused and readable resource for visitors interested in New Gali chart information."],
    ],
  ),
  "new-ghaziabad": chartContent(
    "New Ghaziabad Chart – Historical Information & Records",
    "The New Ghaziabad chart page provides a dedicated resource for reviewing available historical chart information. Visitors can use this page to find New Ghaziabad records without navigating through unrelated chart categories.",
    [
      ["New Ghaziabad Chart Details", "The available information is organized by date and presented in a simple format. This makes the page easier to read and helps visitors understand which records belong to the New Ghaziabad category."],
      ["Historical Records and Context", "Past chart entries are records of earlier information. They may be reviewed for historical context, but they should not be presented as a method for predicting future results or outcomes."],
      ["About This Chart Page", "The New Ghaziabad page focuses on one specific chart category. Maintaining separate pages for different chart types helps create a clearer website structure and makes it easier for visitors to reach the information relevant to their search."],
    ],
  ),
  rozana: chartContent(
    "Rozana Chart – Daily Historical Chart Information",
    "The Rozana chart page provides a dedicated place to review available daily chart information and historical records. The purpose of this page is to present the available information in an easy-to-follow format for visitors.",
    [
      ["Rozana Chart Information", "The chart is organized around dated entries so visitors can understand which information belongs to which day. The layout is kept simple to make it convenient for both new visitors and people returning to review historical records."],
      ["Understanding Daily Chart Records", "Daily records are historical entries associated with specific dates. Reviewing them can help visitors understand previously published information, but historical records should not be considered a guarantee or prediction of future outcomes."],
      ["Rozana Chart Updates", "The page can be maintained as new dated information becomes available. Any corrections or changes should be reflected clearly so that visitors can distinguish current information from older historical records."],
    ],
  ),
  shalimar: chartContent(
    "Shalimar Chart – Historical Records & Chart Information",
    "The Shalimar chart page is a focused resource for visitors looking for historical Shalimar chart information. It keeps the relevant records in one location and provides supporting information so the page is useful beyond the chart table itself.",
    [
      ["Shalimar Chart Details", "Available records are organized according to dates and presented in a simple format. Visitors can review the historical entries while using the page text to understand what type of information is being displayed."],
      ["Reviewing Shalimar Historical Records", "Historical records can provide context about earlier entries. However, information from previous dates does not establish or guarantee a future result. The chart should therefore be understood as a historical reference."],
      ["About the Shalimar Page", "The page is kept specific to Shalimar information rather than combining several different chart categories. This creates a clearer experience for visitors and makes the website structure easier to understand."],
    ],
  ),
  "shri-ganesh": chartContent(
    "Shri Ganesh Chart – Historical Information & Records",
    "The Shri Ganesh chart page provides a dedicated place to review available historical chart information. Visitors interested specifically in Shri Ganesh records can use this page without having to search through unrelated sections.",
    [
      ["Shri Ganesh Chart Information", "The available records are arranged by date in a straightforward chart format. Supporting information on the page explains the purpose of the records and helps visitors understand how the chart section is organized."],
      ["Shri Ganesh Historical Records", "Historical chart entries describe information associated with previous dates. They may be useful for reference and review, but previous records should not be interpreted as a prediction or guarantee of future outcomes."],
      ["Keeping the Chart Page Useful", "The page can be updated when additional historical information is available or when corrections are required. Keeping the content specific to Shri Ganesh helps avoid unnecessary repetition and improves the overall usefulness of the page."],
    ],
  ),
};

const DELHI_BAZAR_YEARS = new Set([2015, 2016, 2017, 2018, 2019, 2020, 2021]);
const SHRI_GANESH_YEARS = new Set([2015, 2016, 2017, 2018, 2019]);

export function getChartPageContent(slug: string): InformationalPageContent | undefined {
  return CHART_PAGE_CONTENT[slug];
}

export function getYearlyPageContent(
  gameSlug: string,
  year: number,
): InformationalPageContent | undefined {
  if (gameSlug === "delhi-bazar" && DELHI_BAZAR_YEARS.has(year)) {
    const suffix = year === 2017 || year === 2020 ? "Historical Information" : "Historical Records";
    return chartContent(
      `Delhi Bazar Yearly Chart ${year} – ${suffix}`,
      `The Delhi Bazar yearly chart for ${year} provides a historical reference to the records associated with that year. This page is intended for visitors who want to review older Delhi Bazar information in a year-specific format.`,
      [
        [`Delhi Bazar Chart Records for ${year}`, `The records on this page are organized around the ${year} period so visitors can distinguish them from information belonging to other years. Keeping each year separate also makes historical browsing easier.`],
        [`Reviewing the ${year} Historical Chart`, "Older chart records can be useful when researching historical information or reviewing how records were presented during a particular period. They should be understood strictly as past information and not as an indication of future outcomes."],
        ["About This Yearly Chart", "This page is part of the yearly Delhi Bazar chart archive. The separate year-based structure allows visitors to move between different historical periods without mixing records from different years."],
      ],
    );
  }

  if (gameSlug === "shri-ganesh" && SHRI_GANESH_YEARS.has(year)) {
    return chartContent(
      `Shri Ganesh Yearly Chart ${year} – Historical Records`,
      `The Shri Ganesh yearly chart ${year} page provides a dedicated historical archive for information associated with the ${year} period. It is designed for visitors who want to review Shri Ganesh records in a year-specific format.`,
      [
        [`Shri Ganesh Chart Records from ${year}`, `The available information is organized around the ${year} period so that visitors can distinguish these historical records from information belonging to other years.`],
        [`Reviewing the ${year} Historical Chart`, "Historical entries can help visitors review previously recorded information. They should be understood as records from the past and not as a method for predicting future outcomes."],
        ["About the Shri Ganesh Yearly Archive", "Separating the records by year creates a clearer historical archive and allows visitors to locate a particular period more easily. The page can be updated if corrections to historical information are required."],
      ],
    );
  }

  return undefined;
}

export const CHART_CONTENT_SLUGS = Object.keys(CHART_PAGE_CONTENT);
