############################################################
### Pakete laden und Working Directory setzen ###

setwd("C:/Users/clari/Desktop/Referat_Wikomm_online")

library(tidyverse)
library(dplyr)
library(tcR)
library('plot.matrix')

############################################################

data_per_observation <- read_csv2("data_per_observation.csv")
#view(data_per_observation)

links_per_observation <- read_csv2("links_per_observation.csv")
#view(links_per_observation)

############################################################

# Gefundene Suchergebnisse 
x11()
ggplot(data_per_observation, aes(x= 0, y=Ergebnisse, color=ID, group=1)) + 
  geom_boxplot() +
  geom_point() +
  labs(title = "Boxplot der Anzahl der gefundenen Suchergebnisse", y = "Anzahl der gefundenen Suchergebnisse", x = "")

##########################

# Wie viele Ergebnisse auf der ersten Seite
x11()
ggplot(data_per_observation, aes(x=0, y=Links, color=ID, group=1)) + 
  geom_boxplot() +
  geom_point() + 
  labs(title = "Boxplot der Anzahl der auf der ersten Seite gefundene Links", y = "Anzahl der gefundenen Links", x = "")

##########################

# Absolute Häuigkeiten der Links
absoluteLinks <- data.frame(count = colSums(links_per_observation[,-1]))
view(absoluteLinks)

##########################

# Wie viel Prozent waren journalistische Angebote?
x11()
ggplot(data_per_observation, aes(x= 0, y=Journalistisch/Links, color=ID, group=1)) + 
  geom_boxplot() +
  geom_point() +
  labs(title = "Boxplot des Anteils der journalistischen Links", y = "Prozentsatz der journalistischen Links", x = "")


##########################

# Übereinstimmende Suchergebnisse
# Wir ignorieren der Einfachheit halber die Tatsache, dass ein und derselbe Link
# mehrfach vorkommen kann!!!
getJaccard <- function (a, b) {
  overlap <- length(intersect(a , b))
  a <- length(intersect(a, a))
  b <- length(intersect(b, b))
  jaccard <- (overlap) / (a + b - overlap)
  
  return(jaccard)
}

ids <- data_per_observation$ID
reducedDf <- data_per_observation
reducedDf <- reducedDf[, colSums(is.na(reducedDf)) != nrow(reducedDf)]
reducedDf$ID <- NULL
reducedDf$Ergebnisse <- NULL
reducedDf$Links <- NULL
reducedDf$Journalistisch <- NULL
view(reducedDf)

dims <- dim(reducedDf)[1]
similarity <- matrix(0, dims, dims)

for (i in 1:dims){
  rowA <- as.character(reducedDf[i,])
  for (j in 1:dims){
      rowB <- as.character(reducedDf[j,])
      rowA <- rowA[!is.na(rowA)]
      rowB <- rowB[!is.na(rowB)]
      similarity[i, j] <- getJaccard(rowA, rowB)
  }
}

similarity <- data.frame(similarity)
colnames(similarity) <- c(ids)
row.names(similarity) <- c(ids)
dt2 <- similarity %>% rownames_to_column() %>%
  gather(colname, value, -rowname)

x11()
ggplot(dt2, aes(x = rowname, y = colname, fill = value)) +
  geom_tile() +
  xlab("") +
  ylab("") +
  ggtitle("Jaccard-Ähnlichkeit") 

