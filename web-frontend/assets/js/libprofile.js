function addCountry(addBtn) {
  // Determine selected country
  const countryElem = $('#countries-add').siblings('select').children('option:selected')
  const countryCode = countryElem.val()
  const countryDesc = countryElem.text().trim()
  // Add country list item
  $('#countries-list').prepend(
`
<li class="list-group-item d-flex justify-content-between align-items-center" code="${countryCode}">
  ${countryDesc}
  <span class="badge badge-primary remover">Remove</span>
</li>
`)
  $('#countries-list span.remover').click(function(e) { removeItem(this) })
}

function listCountries() {
  const countryElems = $('#countries-list').children('li')
  const countries = []
  for (let i=0; i < countryElems.length - 1; ++i)
    countries.push(countryElems[i].attributes.code.value)
  return countries
}

function addTopic() {
  const topic = $('#topics-add').siblings('input').val().trim()
  if (!topic.length) return
  const topicsList = $('#topics-list').prepend(
`
<li class="list-group-item d-flex justify-content-between align-items-center">
  ${topic}
  <span class="badge badge-primary remover">Remove</span>
</li>
`)
  $('#topics-list span.remover').click(function(e) { removeItem(this) })
}

function listTopics() {
  const topicElems = $('#topics-list').children('li')
  const topics = []
  for (let i=0; i < topicElems.length - 1; ++i)
    topics.push(topicElems[i].firstChild.textContent.trim())
  return topics
}

function removeItem(removeBtn) {
  removeBtn.parentElement.remove()
}