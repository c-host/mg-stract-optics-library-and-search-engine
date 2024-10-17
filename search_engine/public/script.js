const searchForm = document.getElementById('searchbar-form');
const searchInput = document.getElementById('search-input');
const opticsSelector = document.getElementById('optics-selector');
const resultsDiv = document.getElementById('results');
const loadingDiv = document.querySelector('.loading');
const opticsPanel = document.getElementById('optics-panel');
const openPanelBtn = document.getElementById('open-panel-btn');
const closePanelBtn = document.getElementById('close-panel-btn');
const testOpticBtn = document.getElementById('test-optic-btn');
const saveOpticBtn = document.getElementById('save-optic-btn');
const opticUrlDiv = document.getElementById('optic-url');

// Initialize CodeMirror if the optics-editor element exists
let editor;
const opticsEditorElem = document.getElementById("optics-editor");
if (opticsEditorElem) {
    editor = CodeMirror.fromTextArea(opticsEditorElem, {
        lineNumbers: true,
        mode: "javascript",
        theme: "default"
    });

    // Set initial content of the editor
    const boilerplateCode = `// Example Optic
Rule {
    Matches {
        Url("metagov.org")
    },
    Action(Boost(1))
};


// Rule Template
// Uncomment to add a rule

/* 
Rule {
    Matches {
        // Add a Site, Url, Domain, Title, Description, Content, or Schema math-location here, ex:
        // Title("self-governance")
    },
    Action(Boost(1))
};
*/

// Change likes to influence rankings
// Uncomment to add a like

/* 
Like(Site("metagov.pubpub.org"));
Like(Site("metagov.org"));
*/

// Uncomment the line below if you want to see only results matching your rules
// DiscardNonMatching;
`;
    editor.setValue(boilerplateCode);
}

function showFeedback(message, isError = false) {
    if (opticUrlDiv) {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.textContent = message;
        feedbackDiv.style.padding = '10px';
        feedbackDiv.style.marginTop = '10px';
        feedbackDiv.style.backgroundColor = isError ? '#ffcccc' : '#ccffcc';
        feedbackDiv.style.border = `1px solid ${isError ? '#ff0000' : '#00ff00'}`;
        opticUrlDiv.appendChild(feedbackDiv);
        setTimeout(() => feedbackDiv.remove(), 5000);
    }
}

const mainContent = document.querySelector('.main-content');

if (openPanelBtn) {
    openPanelBtn.addEventListener('click', () => {
        if (opticsPanel) {
            opticsPanel.classList.add('open');
            mainContent.classList.add('panel-open');
        }
    });
}

if (closePanelBtn) {
    closePanelBtn.addEventListener('click', () => {
        if (opticsPanel) {
            opticsPanel.classList.remove('open');
            mainContent.classList.remove('panel-open');
        }
    });
}

if (testOpticBtn) {
    testOpticBtn.addEventListener('click', async () => {
        if (editor) {
            const opticContent = editor.getValue();
            await performSearch(opticContent);
        }
    });
}

if (searchForm) {
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await performSearch();
    });
}

async function fetchOpticContent(url) {
    if (url.startsWith('http')) {
        // External URL, fetch as before
        return fetch(url).then(response => response.text());
    } else {
        // Local optic file
        return fetch(`/optics/${url}`).then(response => response.text());
    }
}

function validateOptic(optic) {
    return optic.includes('Rule {') && optic.includes('Action(');
}

let currentPage = 1;
let totalPages = 1;
const resultsPerPage = 10;

const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const currentPageSpan = document.getElementById('current-page');
const totalPagesSpan = document.getElementById('total-pages');

async function performSearch(customOpticContent = null, page = 1) {
    console.log('Performing search with custom optic content:', customOpticContent);
    if (loadingDiv) loadingDiv.style.display = 'block';
    if (resultsDiv) resultsDiv.innerHTML = '';

    const query = searchInput ? searchInput.value : '';
    const selectedOpticUrl = opticsSelector ? opticsSelector.value : '';

    console.log('Selected optic URL:', selectedOpticUrl);

    const searchUrl = 'https://stract.com/beta/api/search';

    const params = new URLSearchParams();
    params.set('q', query);
    if (selectedOpticUrl) {
        params.set('optic', selectedOpticUrl);
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    history.pushState(null, '', newUrl);

    console.log('Search URL:', searchUrl);

    const requestBody = {
        query: query,
        numResults: resultsPerPage,
        page: page - 1,  // Stract API uses 0-based indexing
        returnStructuredData: true  // Add this line
    };

    let opticContent = customOpticContent;
    if (!opticContent && selectedOpticUrl) {
        if (selectedOpticUrl.startsWith(window.location.origin)) {
            const opticId = selectedOpticUrl.split('/').pop();
            opticContent = await fetchOpticById(opticId);
        } else {
            opticContent = await fetchOpticContent(selectedOpticUrl);
        }
    }

    if (opticContent) {
        try {
            if (!validateOptic(opticContent)) {
                throw new Error('Invalid optic structure');
            }
            requestBody.optic = opticContent.trim();
            console.log('Optic content:', requestBody.optic);
        } catch (error) {
            console.error('Error validating optic content:', error);
            if (resultsDiv) resultsDiv.innerHTML = '<p>Error: Invalid optic content. Please check your optic syntax and structure.</p>';
            if (loadingDiv) loadingDiv.style.display = 'none';
            return;
        }
    }

    console.log('Request body:', requestBody);

    try {
        const response = await fetch(searchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });


        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            console.error('Response status:', response.status);
            console.error('Response headers:', Object.fromEntries(response.headers.entries()));
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Search results:', data);

        displayResults(data);
        updatePagination(data);
    } catch (error) {
        console.error('Error performing search:', error);
        if (resultsDiv) resultsDiv.innerHTML = `<p>An error occurred while searching: ${error.message}</p>`;
    } finally {
        if (loadingDiv) loadingDiv.style.display = 'none';
    }
}

function displayResults(data) {
    if (!resultsDiv) return;

    resultsDiv.innerHTML = '';
    if (data._type === 'websites' && data.webpages && data.webpages.length > 0) {
        const resultsContainer = document.createElement('div');
        data.webpages.forEach(page => {
            const resultItem = document.createElement('div');
            const snippetHtml = highlightSearchTerms(page.snippet.text.fragments.map(f => f.text).join(''), searchInput.value);
            resultItem.innerHTML = `
                        <h3><a href="${page.url}" target="_blank">${highlightSearchTerms(page.title, searchInput.value)}</a></h3>
                        <p>${snippetHtml}</p>
                        <small>${page.prettyUrl}</small>
                    `;
            resultsContainer.appendChild(resultItem);
        });
        resultsDiv.appendChild(resultsContainer);
    } else {
        resultsDiv.innerHTML = '<p>No results found.</p>';
    }
}

function highlightSearchTerms(text, searchQuery) {
    const terms = searchQuery.split(/\s+/).filter(term => term.length > 0);
    let highlightedText = text;
    terms.forEach(term => {
        const regex = new RegExp(`(${term})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    return highlightedText;
}

function updatePagination(data) {
    if (data._type === 'websites' && data.numHits && data.numHits._type === 'exact') {
        totalPages = Math.ceil(data.numHits.value / resultsPerPage);
    } else {
        totalPages = 1;
    }

    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        performSearch(null, currentPage);
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        performSearch(null, currentPage);
    }
});

// Modify the existing search form event listener
if (searchForm) {
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        currentPage = 1;  // Reset to first page on new search
        await performSearch(null, currentPage);
    });
}

window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    const opticParam = urlParams.get('optic');

    if (searchInput && queryParam) {
        searchInput.value = queryParam;
    }
    if (opticsSelector && opticParam) {
        opticsSelector.value = opticParam;
    }

    if (queryParam) {
        performSearch();
    }
});

if (saveOpticBtn) {
    saveOpticBtn.addEventListener('click', async () => {
        if (!editor) return;

        const opticContent = editor.getValue();
        try {
            console.log('Sending save-optic request'); // Add this line
            const response = await fetch('/save-optic', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ optic: opticContent }),
            });
            console.log('Received response:', response.status); // Add this line
            if (!response.ok) {
                const errorText = await response.text(); // Add this line
                console.error('Error response:', errorText); // Add this line
                throw new Error(`Failed to save optic: ${response.status} ${errorText}`);
            }
            const { id } = await response.json();
            const opticUrl = `${window.location.origin}/optic/${id}`;
            if (opticUrlDiv) opticUrlDiv.innerHTML = `Optic URL: <a href="${opticUrl}" target="_blank">${opticUrl}</a>`;

            const customOpticOption = document.getElementById('custom-optic-option');
            if (customOpticOption) {
                customOpticOption.value = opticUrl;
                customOpticOption.textContent = `Custom Optic (${id})`;
            }
            if (opticsSelector) opticsSelector.value = opticUrl;

            console.log('Optic saved successfully. ID:', id, 'URL:', opticUrl);
            showFeedback('Optic saved successfully!');
        } catch (error) {
            console.error('Error saving optic:', error);
            showFeedback(`Failed to save optic. Error: ${error.message}`, true);
        }
    });
}

async function fetchOpticById(id) {
    console.log('Fetching optic by ID:', id);
    try {
        const response = await fetch(`/optic/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const content = await response.text();
        console.log('Fetched optic content:', content);
        return content;
    } catch (error) {
        console.error('Error fetching optic content:', error);
        return null;
    }
}
