import React, { useState, useEffect } from 'react';
import "./git-issues.css"

const GitHubIssuesComponent = () => {
    const [repoName, setRepoName] = useState('');
    const [input, setInput] = useState('');
    const [issues, setIssues] = useState([]);
    const [statusCounts, setStatusCounts] = useState({});
    const [weekWiseCounts, setWeekWiseCounts] = useState({});
    const [newVsClosedRatio, setNewVsClosedRatio] = useState(null);
    const [weeklyClosureRate, setWeeklyClosureRate] = useState([]);
    const [averageWeeklyClosureRate, setAverageWeeklyClosureRate] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const response = await fetch(`https://api.github.com/repos/${repoName}/issues?per_page=1000`);
                if (!response.ok) {
                    alert("Invalid repo name")
                    throw new Error(`Error - ${response.status}`);
                }
                const data = await response.json();


                const statusCounts = { open: 0, closed: 0 };
                data.forEach(issue => {
                    statusCounts[issue.state]++;
                });


                const weeklyStatusCount = {
                    "Week 1": { open: 0, closed: 0 },
                    "Week 2": { open: 0, closed: 0 },
                    "Week 3": { open: 0, closed: 0 },
                    "Week 4": { open: 0, closed: 0 },
                    "Week 5": { open: 0, closed: 0 },
                    "Week 6": { open: 0, closed: 0 },
                    "Week 7": { open: 0, closed: 0 },
                    "Week 8": { open: 0, closed: 0 },
                    "Week 9": { open: 0, closed: 0 },
                    "Week 10": { open: 0, closed: 0 },
                }


                const weekWiseCounts = {
                    "Week 1": 0,
                    "Week 2": 0,
                    "Week 3": 0,
                    "Week 4": 0,
                    "Week 5": 0,
                    "Week 6": 0,
                    "Week 7": 0,
                    "Week 8": 0,
                    "Week 9": 0,
                    "Week 10": 0,
                };
                data.forEach(issue => {
                    const createdAt = new Date(issue.created_at);
                    const weekNumber = getWeekNumber(createdAt);
                    if (weekNumber > -1) {
                        weekWiseCounts[`Week ${weekNumber}`] = 1;
                        weeklyStatusCount[`Week ${weekNumber}`][issue.state]++
                    }
                });

                const newVsClosedRatio = {
                    "Week 1": 'No closed issues',
                    "Week 2": 'No closed issues',
                    "Week 3": 'No closed issues',
                    "Week 4": 'No closed issues',
                    "Week 5": 'No closed issues',
                    "Week 6": 'No closed issues',
                    "Week 7": 'No closed issues',
                    "Week 8": 'No closed issues',
                    "Week 9": 'No closed issues',
                    "Week 10": 'No closed issues',
                };

                data.forEach(issue => {
                    const createdAt = new Date(issue.created_at);
                    const weekNumber = getWeekNumber(createdAt);
                    if (weekNumber > -1) {
                        const newCount = weeklyStatusCount[`Week ${weekNumber}`].open;
                        const closedCount = weeklyStatusCount[`Week ${weekNumber}`].closed;
                        newVsClosedRatio[`Week ${weekNumber}`] = closedCount === 0 ? 'No closed issues' : (newCount / closedCount).toFixed(2)
                    }
                });




                const weeklyClosureRate = calculateWeeklyClosureRate(data);

                const sumOfClosureRates = weeklyClosureRate.reduce((total, weekData) => total + weekData.closureRate, 0);

                const averageWeeklyClosureRate = sumOfClosureRates / weeklyClosureRate.length;


                setIssues(data);
                setStatusCounts(statusCounts);
                setWeekWiseCounts(weekWiseCounts);
                setNewVsClosedRatio(newVsClosedRatio);
                setWeeklyClosureRate(weeklyClosureRate);
                setAverageWeeklyClosureRate(averageWeeklyClosureRate);
            } catch (error) {
                console.error('Error fetching gitHub issues - ', error);
            }
        };

        if (repoName) {
            fetchIssues();
        }
    }, [repoName]);


    const getWeekNumber = (inputDate) => {
        inputDate = new Date(inputDate)
        const today = new Date();
        const lastWeeks = [];

        for (let i = 9; i >= 0; i--) {
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - i * 7);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);

            lastWeeks.push({ startDate, endDate });
        }

        const inputDateObj = new Date(inputDate);
        for (let i = 0; i < lastWeeks.length; i++) {
            const { startDate, endDate } = lastWeeks[i];
            if (inputDateObj >= startDate && inputDateObj <= endDate) {
                return i + 1;
            }
        }

        return -1;

    };

    const calculateWeeklyClosureRate = (issues) => {
        const weeksData = {};

        issues.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        let currentWeek = 1;
        let startDate = new Date(issues[0].created_at);
        startDate.setHours(0, 0, 0, 0);

        for (const issue of issues) {
            const issueDate = new Date(issue.created_at);
            issueDate.setHours(0, 0, 0, 0);


            while (issueDate > new Date(startDate).setDate(startDate.getDate() + 6)) {

                currentWeek++;
                startDate.setDate(startDate.getDate() + 7);
            }

            if (!weeksData[currentWeek]) {
                weeksData[currentWeek] = {
                    opened: 0,
                    closed: 0,
                };
            }

            weeksData[currentWeek].opened++;

            if (issue.closed_at) {
                weeksData[currentWeek].closed++;
            }
        }

        const closureRates = [];

        for (let week = 1; week <= currentWeek; week++) {
            if (closureRates.length > 9) {
                break
            }
            const weekData = weeksData[week] || { opened: 0, closed: 0 };
            const openedThisWeek = weekData.opened;
            const closedThisWeek = weekData.closed;

            if (openedThisWeek === undefined || closedThisWeek === undefined) {
                continue;
            }


            const closureRate = closedThisWeek / (openedThisWeek + (weeksData[week - 1] ? weeksData[week - 1].opened : 0));

            closureRates.push({
                week,
                closureRate,
            });
        }

        return closureRates;
    };



    return (
        <div style={{ textAlign: 'center', marginTop: "1em" }}>
            <input
                type="text"
                placeholder="Enter GitHub Repo Name ( owner/repo )"
                className="repo-input"
                onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={() => setRepoName(input)}>Fetch Issues</button>
            {
                issues.length ?
                    <div>
                        <h2>GitHub Repository Issues:</h2>
                        <div className='status-div'>
                            <div>
                                open - {statusCounts.open}
                            </div>
                            <div>
                                closed - {statusCounts.closed}
                            </div>
                        </div>
                        <div className='issue-list'>
                            <ul>
                                {issues.map(issue => (
                                    <li key={issue.id}>
                                        <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
                                            {issue.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <h2>Week Wise Issue Count (last 10 weeks):</h2>
                        <div className='issue-list'>
                            <ul>
                                {Object.entries(weekWiseCounts).map(count => (
                                    <li key={count[0]}>
                                        {count[0]} - {count[1]}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2>New vs. Closed Ratio:</h2>
                            <div className='issue-list'>
                                <ul>
                                    {Object.entries(newVsClosedRatio).map(count => (
                                        <li key={count[0]}>
                                            {count[0]} - {count[1]}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <h2>Weekly Closure Rate:</h2>
                        <div className='issue-list'>
                            <ul>
                                {weeklyClosureRate.map(item => (
                                    <li key={item.week}>
                                        Week {item.week} - {item.closureRate}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2>Average Weekly Closure Rate:</h2>
                            <p>{averageWeeklyClosureRate}</p>
                        </div>
                        <button onClick={() => setShowModal(true)}>Show Modal</button>
                        {showModal && (
                            <div>
                                <h2>Table containing list of Issues</h2>
                                <div className="modal issue-list">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Issue Title</th>
                                                <th>Creation Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {issues.map(issue => (
                                                <tr key={issue.id}>
                                                    <td>
                                                        <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
                                                            {issue.title}
                                                        </a>
                                                    </td>
                                                    <td>{new Date(issue.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        )}
                    </div> : ""
            }

        </div>
    );
};

export default GitHubIssuesComponent;
