const settings = {
  name: "ways4euwp-01",
  state: {
    frontity: {
      url: "https://ways4euwp-01.now.sh/",
      title: "Ways4eu WordPress.com Blog",
      description: "WordPress Site in Frontity development",
    },
  },
  packages: [
    {
      name: "@frontity/twentytwenty-theme",
      state: {
          theme: {
              menu: [
                  [
                    "Home",
                    "/"
                  ],
                  [
                    "Hot-React",
                    "/category/hot-react"
                  ],
                  [
                    "Tips&Tricks",
                    "/category/tips_tricks"
                  ],
                  [
                    "ReadingList",
                    "/category/readinglist"
                  ],
                  [
                    "Education",
                    "/category/education"
                  ], 
                  [
                    "Javascript",
                    "/tag/javascript"
                  ],                                    
                  [
                    "Wikipedia",
                    "/category/wikipedia"
                  ],
                  [
                    "NASA",
                    "/category/nasa"
                  ],            
                  [
                    "Art",
                    "/tag/art"
                  ],                                                            
                  [
                    "Music",
                    "/tag/music"
                  ]            
                ],
              colors: {
                //primary: "#E6324B",
                primary: "#46614f",
                //headerBg: "#ffffff",
                headerBg: "#f1f5eb",
                //footerBg: "#ffffff",
                footerBg: "#f1f5eb",
                bodyBg: "#e8e6e1",
                /* bodyBg: "#f5efe0" */
              },
              showSearchInHeader: true,
              showAllContentOnArchive: false,
              featuredMedia: {
                showOnArchive: true,
                showOnPost: true
              },
              autoPreFetch: "all",
              fontSets: "us-ascii"
            }
      },
    },
    {
      name: "@frontity/wp-source",
      state: {
        source: {
          api:
            "https://public-api.wordpress.com/wp/v2/sites/ways4eu.wordpress.com",
        },
      },
    },
    "@frontity/tiny-router",
    "@frontity/html2react",
  ],
};

export default settings;
