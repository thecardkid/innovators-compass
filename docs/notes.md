# Notes

Reference points for comments that require or more context, or the same comment made in several files.

### N1

When I made iCompass I only knew of putting one people group in the middle. So the schema was set to `center: string`. I've since found that others require multiple people groups. To avoid doing a migration, which must be timed with a prod deploy (complicated, many things can go wrong), I've continued to use a `string` but have it act as an array, with a `;` delimiter. All elements must not contain the delimiter.

All front-end code will treat `center` as an Array. The transformation is done in the reducer `compass.js`. 

In the back-end, the socket handler for `"set center"` simply passes it on to the model's `setCenter` method, where it converted to a string to store in Mongo.
