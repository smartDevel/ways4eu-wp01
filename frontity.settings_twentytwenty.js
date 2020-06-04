const settings = {
    name: "ways4euwp-01",
    state: {
      frontity: {
        url: "https://test.frontity.org",
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
                  primary: "#E6324B",
                  headerBg: "#ffffff",
                  footerBg: "#ffffff",
                  bodyBg: "#f5efe0"
                },
                showSearchInHeader: true,
                showAllContentOnArchive: false,
                featuredMedia: {
                  showOnArchive: true,
                  showOnPost: true
                },
                autoPreFetch: "hover",
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
  