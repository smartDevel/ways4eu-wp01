const settings = {
  name: "ways4euwp-01",
  state: {
    frontity: {
      url: "https://ways4eu.wordpress.com/",
      title: "Blog to reflect n smile...",
      description: "...where decency ends and fun begins 🤘😎",
    },
  },
  packages: [
    {
      name: "@frontity/twentytwenty-theme",
      state: {
          theme: {
              menu: [
                  {
                    name: 'Home',
                    href: '/',
                  },
                  {
                    name: 'Hot-React',
                    href: '/category/hot-react',
                  },
                  {
                    name: 'Tips&Tricks',
                    href: '/category/tips_tricks',
                  },
                  {
                    name: 'ReadingList',
                    href: '/category/readinglist',
                  },
                  {
                    name: 'Education',
                    href: '/category/education',
                  }, 
                  {
                    name: 'Javascript',
                    href: '/tag/javascript',
                    submenu: [
                      {
                        name: 'Hot-React',
                        href: '/category/hot-react'
                      },
                      {
                        name: 'Education',
                        href: '/category/education'
                      }
                    ]
                  },                                    
                  {
                    name: 'Wikipedia',
                    href: '/category/wikipedia',
                  },
                  {
                    name: 'NASA',
                    href: '/category/nasa',
                  },            
                  {
                    name: 'Art',
                    href: '/tag/art',
                  },                                                            
                  {
                    name: 'Music',
                    href: '/tag/music',
                  }            
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
