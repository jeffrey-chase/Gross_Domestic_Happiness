library(readxl)
library(tidyverse)
setwd('Desktop/School Work/Spring 2019/Information Visualization/projects/GDH/')
all_data <- tibble()

makeSafeNames <- function (headers) {
  for (i in 1:length(headers)) {
    headers[i] <- headers[i] %>%
      stringr::str_trim(side="both") %>%
      stringr::str_replace( '[ ]', '_') %>%
      stringr::str_to_lower() 
  }
  return(headers) 
}


for (i in 2015:2018) {
  data <- read_csv(paste0('data/raw_data/',i, '.csv'))
  names(data) <- makeSafeNames(names(data))
  
  data <- data %>%
    select(c(country, happiness_score, happiness_rank)) %>%
    mutate(year=i)
           
  all_data <- rbind(all_data, data)
}

codes <- read_csv('data/codes.csv') %>% select(-X5)
codes


all_data <- all_data %>%
  left_join(codes, by=c('country'='Country')) %>%
  select(-original_name)



write_csv(all_data, "data/combined_data.csv")
