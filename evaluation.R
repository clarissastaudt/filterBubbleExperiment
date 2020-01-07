############################################################
### Pakete laden und Working Directory setzen ###

setwd("C:/Users/clari/Desktop/Referat_Wikomm_online")

library(tidyverse)
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

getJaccard <- function (a, b) {
  overlap <- length(intersect(a , b))
  a <- length(a)
  b <- length(b)
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

similarity <- matrix(0, dim(reducedDf)[1], dim(reducedDf)[1])

for (i in 1:dim(reducedDf)[1]){
  rowA <- as.character(reducedDf[i,])
  for (j in 1:dim(reducedDf)[1]){
    if (i == j) {
      similarity[i, j] <- 1
    }
    else {
      rowB <- as.character(reducedDf[j,])
      similarity[i, j] <- getJaccard(na.omit(rowA), na.omit(rowB))
    }
  }
}

x11()
par(bg = '#1c1c1c')
par(mar=c(5.1, 4.1, 4.1, 4.1)) # adapt margins
plot(xaxt="n", yaxt="n", ann=FALSE,  similarity, border=NA, digits=2, text.cell=list(cex=1), breaks=100, col=colorRampPalette(c("#ffffff","#1c1c1c"))(100), xlab="", ylab="", main="",  key=NULL)
axis(1, at=1:dim(reducedDf)[1], labels=c(ids), col.axis="white")
axis(2, at=1:dim(reducedDf)[1], labels=c(ids), col.axis="white")
title(main = "Jaccard-Ähnlichkeit", col.main ="white")