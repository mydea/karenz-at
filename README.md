# karenz-at

This is a German-language JS-based website that gives information and utilities surrounding Karenz (parental leave) in Austria.

It is an app using react-router, that should eventually be deployed to Cloudflare.

Functionality:

0. Settings/data entry page
1. Timeline: A timeline/calendar view that allows to enter projected/actual birth date and see relevant things in a timeline view. It should show deadlines, cutoff dates etc.
2. Money calculator: A view that allows to enter recent work time and salary of both partners and show expected money per month based on different selected parental leave models.
3. FAQ: A collection of relevant information, possibly linked to timeline.

There should be a few data points the user has to enter which will be stored in local storage:
1. Due date - can be in the past (actual) or in the future (estimated)
2. Salary - the (average) monthly/yearly Salary of both parents in the recent past. Used as basis of calculation.
3. Work start date - optionally, when each parent has started working. Only relevant if start was <6 months ago.
4. Planned parental leave model - how parental leave should be split between parents.
5. Additonal (optional) data: Ceasarian (necessary for Mutterschutz calculation)