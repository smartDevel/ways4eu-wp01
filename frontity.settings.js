const settings = {
  "name": "ways4euwp-01",
  "state": {
    "frontity": {
      "url": "https://ways4eu.wordpress.com/",
      "title": "Ways4eu WordPress.com Blog",
      "description": "SPA View of ways4eu.wordpress.com"
    }
  },
  "packages": [
    {
      "name": "@frontity/mars-theme",
      "state": {
        "theme": {
          "menu": [
            [
              "Home",
              "/"
            ],
            [
              "Rhymes",
              "/tag/rhymes"
            ],
            [
              "Quotes",
              "/tag/brainyquote"
            ],
            [
              "Music",
              "/tag/music"
            ],
            [
              "Fun",
              "/tag/fun"
            ],
            [
              "Interesting",
              "/tag/interesting"
            ],
            [
              "NASA",
              "/category/nasa"
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
              "Reading-List",
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
            ]                                                                                         
          ],
          "featured": {
            "showOnList": false,
            "showOnPost": false
          }
        }
      }
    },
    {
      "name": "@frontity/wp-source",
      "state": {
        "source": {
          "api": "https://public-api.wordpress.com/wp/v2/sites/ways4eu.wordpress.com"
        }
      }
    },
    "@frontity/tiny-router",
    "@frontity/html2react"
  ]
};

export default settings;
