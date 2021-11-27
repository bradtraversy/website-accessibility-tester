const issuesOutput = document.querySelector('#issues')
const issuesCount = document.querySelector('#number')
const alertMessage= '<div class="alert alert-danger" role="alert">Something went wrong</div>'
const emptyUrl= '<div class="alert alert-danger" role="alert">Please add an URL</div>'
const warningMessage= '<div class="alert alert-warning" role="alert">no Issues Found</div>'
const CsvMessage= '<div class="alert alert-warning" role="alert">CSV not available</div>'


// Fetch accessibility issues
const testAccessibility = async (e) => {
  e.preventDefault()
  const url = document.querySelector('#url').value
  if (url === '') {
    issuesOutput.innerHTML = emptyUrl
  } else {
    setLoading()

    const response = await fetch(`/api/test?url=${url}`)

    if (response.status !== 200) {
      setLoading(false)
      issuesOutput.innerHTML = alertMessage
    } else {
      const { issues } = await response.json()
      addIssuesToDOM(issues)
      setLoading(false)
      document.getElementById("clearResults").classList.remove("hideButton")
      document.getElementById("csvBtn").classList.remove("hideButton")
    }
  }
}

//Download CSV
const csvIssues = async (e) => {
  e.preventDefault()
  const url = document.querySelector('#url').value
  if (url === '') {
    issuesOutput.innerHTML = emptyUrl
  }
  else {
    const response = await fetch(`/api/test?url=${url}`)

    if (response.status !== 200) {
      setLoading(false)
      alert(csvMessage)
    } 
    else if(issues.length === 0){
      alert(CsvMessage)
    }
    else {
      const { issues } = await response.json()
        const csv = issues.map(issue => {
          return `${issue.code},${issue.message},${issue.context}`
        }).join('\n')
    
        const csvBlob = new Blob([csv], { type: 'text/csv' })
        const csvUrl = URL.createObjectURL(csvBlob)
        const link = document.createElement('a')
        link.href = csvUrl
        link.download = 'Accessibility_issues_list_'+url.substring(12)+'.csv'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)      
    }
  }
}

// Add issues to DOM
const addIssuesToDOM = (issues) => {
  
  issuesOutput.innerHTML = ''
  issuesCount.innerHTML = ''

  if (issues.length === 0) {
    issuesOutput.innerHTML = warningMessage
  } else {
    issuesCount.innerHTML = `
      <p class="alert alert-warning">${issues.length} issues found !</p>
    `
    issues.forEach((issue) => {
      const output = `
        <div class="card mb-5">
          <div class="card-body">
            <h4>${issue.message}</h4>

            <p class="bg-light p-3 my-3">
              ${escapeHTML(issue.context)}
            </p>

            <p class="bg-secondary text-light p-2">
              CODE: ${issue.code}
            </p>
          </div>
        </div>
      `

      issuesOutput.innerHTML += output
    })
  }
}

// Set loading state
const setLoading = (isLoading = true) => {
  const loader = document.querySelector('.loader')
  if (isLoading) {
    loader.style.display = 'block'
    issuesOutput.innerHTML = ''
  } else {
    loader.style.display = 'none'
  }
}

// Escape HTML
function escapeHTML(html) {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

//Clear results
const clearResults = (e) => {
  e.preventDefault()
  issuesOutput.innerHTML = ''
  issuesCount.innerHTML = ''
  document.querySelector('#url').value = ''
}

document.querySelector('#form').addEventListener('submit', testAccessibility)
document.querySelector('#clearResults').addEventListener('click', clearResults)
document.querySelector('#csvBtn').addEventListener('click', csvIssues)