##Numina Data Project

This project visualizes data from the Numina Data API.  The data includes pedestrian and cycle counts every 5 seconds for a 2 hour period.
In order to visualize this data, I started with a use case in which this data may be useful.  Transportation planners frequently use count
data when assessing the traffic impacts of a new construction.  Counts are used to predict future traffic due to increased vehicle, pedestrian
and bicycle movements.  Planner traditionally look at data over 15 minute increments and select the hour in which the highest
traffic volume was observed.  As such, this visualization allows users to see the data broken into 15 minute increments and view
the cumulative hourly pedestrian and bicycle counts.  Viewers are also able to see data summarized by hour.  While this view is
not particularly compelling given the limited timeframe of this data, I believe viewing data by hour will be increasingly useful as
more data is added to the UI.

As pedestrian and cycle counts are typically analyzed separately, this visualization is structured with the assumption that viewers are interested in looking at either bicycle counts or pedestrian counts.
The use of the line chart gives users a quick snapshot of the data where they can visualize trends.  The table below shows more
detailed data that could be used in a report or as the raw inputs for traffic software.

This client-side project was built using Angular.js.  While this application is relatively small, I used less.js and a standard
file structure so that the application could be expanded with relative ease.

Currently the API returns pedestrian and bicyclist data at 5 second intervals.  As I did not have access to update the API, I did all
of the data manipulation on the client-side.  While this did not significantly affect the performance of the application, given
the quantity of data, some additional updates could be made in the future to accommodate larger amounts of data.  For example, the
API could:
 - return data at intervals that met specific user needs such as 1 minute, 15 minutes, 1 hour, 1 day etc (more user research required)
 - return either pedestrian or bicyclist data as the users requests it from the front-end
 - be made smaller by returning each timestamp only once and including both a bike and pedestrian count

 In order to run this project, clone the repo, run npm install and navigate to index.html in your browser.