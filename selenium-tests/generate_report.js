const ExcelJS = require('exceljs');
const path = require('path');

async function generateReport(results = {}) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Web E2E Analysis');

    // Define column structures
    worksheet.columns = [
        { header: 'Test Case ID', key: 'id', width: 15 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'Module/Feature', key: 'module', width: 18 },
        { header: 'Description', key: 'desc', width: 45 },
        { header: 'Preconditions', key: 'precond', width: 35 },
        { header: 'Expected Result', key: 'expected', width: 45 },
        { header: 'Severity', key: 'severity', width: 12 },
        { header: 'Method', key: 'method', width: 15 },
        { header: 'Execution Status', key: 'status', width: 18 },
        { header: 'Execution Date/Log', key: 'log', width: 35 }
    ];

    // Define 102 Web Test Cases
    const testCases = [];

    // UI/UX Testing (30 cases)
    for (let i = 1; i <= 30; i++) {
        testCases.push({
            id: `WEB_UI_${String(i).padStart(3, '0')}`,
            category: 'UI/UX',
            module: i <= 10 ? 'Landing Page' : (i <= 20 ? 'Auth Forms' : 'Dashboard Area'),
            desc: `Verify UI elements scaling, responsiveness, alignment, and visibility constraint for index ${i}.`,
            precond: 'Browser window initialized at standard layout viewport resolution.',
            expected: 'All layout items are correctly padded, visible, and match contrast specifications.',
            severity: i % 3 === 0 ? 'High' : (i % 3 === 1 ? 'Medium' : 'Low'),
            method: 'Manual',
            status: 'UNTESTED',
            log: 'Not run'
        });
    }

    // Functional Testing (30 cases)
    for (let i = 1; i <= 30; i++) {
        testCases.push({
            id: `WEB_FUNC_${String(i).padStart(3, '0')}`,
            category: 'Functional',
            module: i <= 10 ? 'Auth/Redirection' : (i <= 20 ? 'Skills Listing' : 'Chat & Reviews'),
            desc: `Validate state change operations, click navigation response, and correct DB integration state for function check ${i}.`,
            precond: 'User session active or redirected to auth login screen.',
            expected: 'State change fires successfully, correct event hooks triggered, and UI outputs update.',
            severity: i % 4 === 0 ? 'High' : (i % 4 === 1 ? 'Medium' : 'Low'),
            method: 'Manual',
            status: 'UNTESTED',
            log: 'Not run'
        });
    }

    // Unit & Limit Testing (20 cases)
    for (let i = 1; i <= 20; i++) {
        testCases.push({
            id: `WEB_UNIT_${String(i).padStart(3, '0')}`,
            category: 'Unit/Limit',
            module: i <= 10 ? 'Database Session' : 'Inputs Size Limits',
            desc: `Check bounds constraints, empty data values, network latency failure, and API schema validations for condition ${i}.`,
            precond: 'Direct SQL environment setup or REST API parameter boundaries mockup.',
            expected: 'System handles boundary bounds, displays fallback logs, and triggers soft validation warnings.',
            severity: i % 2 === 0 ? 'Medium' : 'Low',
            method: 'Manual',
            status: 'UNTESTED',
            log: 'Not run'
        });
    }

    // Security & Validation (22 cases)
    for (let i = 1; i <= 22; i++) {
        testCases.push({
            id: `WEB_SEC_${String(i).padStart(3, '0')}`,
            category: 'Security/Validation',
            module: i <= 11 ? 'Auth Inputs Sanitization' : 'API RLS Boundaries',
            desc: `Test XSS attack injections, SQL characters escape queries, raw API request bypass, and incorrect session key reject for case ${i}.`,
            precond: 'Supabase instance running with active connection or mock payload targets.',
            expected: 'All invalid payloads sanitized or blocked, API returns correct status codes.',
            severity: i % 2 === 0 ? 'High' : 'Medium',
            method: 'Manual',
            status: 'UNTESTED',
            log: 'Not run'
        });
    }

    // Map automated execution results
    const automatedCases = [
        { id: 'WEB_FUNC_001', matchId: 'should successfully log in to the application', module: 'Auth/Redirection', desc: 'Verify login flow inputting valid credentials redirects user to #dashboard.' },
        { id: 'WEB_UI_011', matchId: 'should load the landing/auth page and find the login form', module: 'Auth Forms', desc: 'Verify login form fields and submit button are displayed on #auth.' },
        { id: 'WEB_FUNC_002', matchId: 'should load dashboard and show add skill button', module: 'Dashboard Area', desc: 'Verify that logged in users see the Add New Skill button.' },
        { id: 'WEB_FUNC_003', matchId: 'should successfully post a new skill listing', module: 'Skills Listing', desc: 'Verify that submitting the skill listing form successfully adds a skill card.' },
        { id: 'WEB_FUNC_004', matchId: 'should navigate to the profile section and update user profile', module: 'Chat & Reviews', desc: 'Verify that profile page allows updating profile bio and saving changes.' }
    ];

    automatedCases.forEach(auto => {
        const found = testCases.find(tc => tc.id === auto.id);
        if (found) {
            found.method = 'Automated';
            found.module = auto.module;
            found.desc = auto.desc;
            
            if (results[auto.matchId]) {
                const res = results[auto.matchId];
                found.status = res.passed ? 'PASS' : 'FAIL';
                found.log = res.passed ? `Automated run passed in ${res.duration}ms` : `Failed: ${res.error}`;
                found.precond = 'Local server running on port 8080 and clean Chrome environment.';
                found.expected = 'Test case runs, executes browser triggers, and satisfies all DOM assertions.';
            }
        }
    });

    // Add rows to worksheet
    testCases.forEach(tc => {
        worksheet.addRow(tc);
    });

    // Formatting styles
    // Header Style: Dark Navy background, bold white text
    worksheet.getRow(1).eachCell(cell => {
        cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFF' }, size: 11 };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '1F497D' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.border = {
            bottom: { style: 'medium', color: { argb: '000000' } }
        };
    });

    worksheet.getRow(1).height = 25;

    // Data Row Styles
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            row.height = 20;
            row.eachCell(cell => {
                cell.font = { name: 'Arial', size: 10 };
                cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
                cell.border = {
                    bottom: { style: 'thin', color: { argb: 'E0E0E0' } },
                    right: { style: 'thin', color: { argb: 'F5F5F5' } }
                };
            });

            // Color status cells
            const statusCell = row.getCell('status');
            if (statusCell.value === 'PASS') {
                statusCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'D4EDDA' } // Light Green
                };
                statusCell.font = { name: 'Arial', bold: true, color: { argb: '155724' } };
            } else if (statusCell.value === 'FAIL') {
                statusCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'F8D7DA' } // Light Red
                };
                statusCell.font = { name: 'Arial', bold: true, color: { argb: '721C24' } };
            } else if (statusCell.value === 'UNTESTED') {
                statusCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF3CD' } // Light Yellow
                };
                statusCell.font = { name: 'Arial', color: { argb: '856404' } };
            }

            // Severity styling
            const severityCell = row.getCell('severity');
            if (severityCell.value === 'High') {
                severityCell.font = { name: 'Arial', bold: true, color: { argb: 'DC3545' } }; // Red
            }

            // Method styling
            const methodCell = row.getCell('method');
            if (methodCell.value === 'Automated') {
                methodCell.font = { name: 'Arial', bold: true, color: { argb: '007BFF' } }; // Blue
            }
        }
    });

    // Save report
    const outputPath = path.join(__dirname, 'E2E_Web_Test_Report.xlsx');
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Report successfully compiled at: ${outputPath}`);
}

module.exports = { generateReport };

// If run directly
if (require.main === module) {
    generateReport().catch(err => console.error(err));
}
