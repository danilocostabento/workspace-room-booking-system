/**
  * [API] Searches for people in the DIRECTORY (entire company) using the People API.
  * Requires the 'People API' Advanced Service to be enabled.
  * @param {string} query The search term (name or email).
  * @return {Array<object>} A list of {name, email}.
*/
function searchContacts(query) {
  if (!query || query.length < 3) {
    return [];
  }
  
  try {
    const service = People.People;
    const response = service.searchDirectoryPeople({
      query: query,
      readMask: 'names,emailAddresses', // Request name and email
      sources: ['DIRECTORY_SOURCE_TYPE_DOMAIN_CONTACT', 'DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE'],
      pageSize: 5 // Limits to 5 results
    });
    
    const people = response.people || [];
    const results = [];

    people.forEach(person => {
      // Get the person's main name and main email
      const name = (person.names && person.names.length > 0) ? person.names[0].displayName : null;
      const email = (person.emailAddresses && person.emailAddresses.length > 0) ? person.emailAddresses[0].value : null;
      
      if (name && email) {
        results.push({ name: name, email: email });
      }
    });
    
    return results;

  } catch (e) {
    // If the People API service is not enabled in Google Cloud,
    // or if the user does not have directory permission, this may fail.
    Logger.log('Error fetching from the People API: ' + e.message);
    return [];
  }
}
