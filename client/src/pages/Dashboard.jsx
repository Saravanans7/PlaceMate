import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, Table, Button } from '../components/UI.jsx';
import BarChart from '../components/BarChart.jsx';
import LoadingWrapper from '../components/LoadingWrapper.jsx';
import {
  SkeletonDashboard,
  SkeletonTable,
  SkeletonCard,
} from '../components/SkeletonComponents.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [todayDrives, setTodayDrives] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [batches, setBatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [placementStatus, setPlacementStatus] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Refresh placement status
  async function refreshPlacementStatus() {
    if (user.role === 'student' && user._id) {
      setIsRefreshing(true);
      try {
        const response = await fetch(
          `/api/drives/student/${user._id}/placement-status`,
          { credentials: 'include' }
        );
        const data = await response.json();

        if (response.ok) {
          console.log('Placement status refreshed:', data);
          setPlacementStatus(data.data || null);
          setLastRefresh(Date.now());
        } else {
          console.error('Failed to refresh placement status:', data);
        }
      } catch (error) {
        console.error('Error refreshing placement status:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  }

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      try {
        const [drivesRes, registrationsRes] = await Promise.all([
          fetch('/api/drives?date=today', { credentials: 'include' }),
          fetch('/api/registrations?status=open&range=next30', {
            credentials: 'include',
          }),
        ]);

        const [drivesData, registrationsData] = await Promise.all([
          drivesRes.json(),
          registrationsRes.json(),
        ]);

        setTodayDrives(drivesData.data || []);
        setUpcoming(registrationsData.data || []);

        if (user.role === 'staff') {
          const batchesRes = await fetch('/api/stats/batches', {
            credentials: 'include',
          });
          const batchesData = await batchesRes.json();
          setBatches(batchesData.data || []);
        } else if (user.role === 'student' && user._id) {
          const applicationsRes = await fetch(
            `/api/users/${user._id}/applications`,
            { credentials: 'include' }
          );
          const applicationsData = await applicationsRes.json();
          console.log('Applications data:', applicationsData);
          setApplications(applicationsData.data || []);
          await refreshPlacementStatus();
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user.role, user._id]);

  // Auto-refresh placement status every 30 seconds for students
  useEffect(() => {
    if (user.role === 'student' && user._id) {
      const interval = setInterval(() => {
        refreshPlacementStatus();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user.role, user._id, placementStatus]);

  // Skeletons for loading
  const staffSkeleton = (
    <div className="container grid-2">
      <div className="stack">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="stack">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );

  const studentSkeleton = (
    <div className="container grid-2">
      <div className="stack">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="stack">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );

  // ---------------- STAFF DASHBOARD ----------------
  if (user.role === 'staff') {
    return (
      <LoadingWrapper
        isLoading={isLoading}
        skeletonComponent={staffSkeleton}
        loadingMessage="Loading dashboard..."
      >
        <div className="container grid-2">
          <div className="stack">
            <Card
              title="Today's Drives"
              actions={
                <div className="card-actions">
                  <a
                    className="btn btn-primary"
                    href="/company/create-registration"
                  >
                    + Create Drive
                  </a>
                </div>
              }
            >
              <div className="table-card">
                <Table
                  columns={[
                    { label: 'Company', key: 'company' },
                    {
                      label: 'Status',
                      render: (r) => (r.isClosed ? 'Closed' : 'Active'),
                    },
                    {
                      label: 'Students',
                      render: (r) => r.registration?.applicants?.length || 0,
                    },
                    {
                      label: 'Actions',
                      render: (r) => (
                        <div className="action-buttons">
                          <a
                            className="btn btn-secondary btn-sm"
                            href={`/staff/drive/${r.id}`}
                          >
                            Manage
                          </a>
                          <a
                            className="btn btn-primary btn-sm"
                            href={`/staff/drive/${r.id}`}
                          >
                            👁️ View
                          </a>
                        </div>
                      ),
                    },
                  ]}
                  rows={todayDrives.map((d) => ({
                    id: d._id,
                    company:
                      d.company?.name ||
                      d.registration?.companyNameCached ||
                      '—',
                    registration: d.registration,
                    isClosed: d.isClosed,
                    applicants: d.registration?.applicants,
                  }))}
                />
              </div>
            </Card>

            <Card title="Upcoming Drives">
              <div className="table-card">
                <Table
                  columns={[
                    { label: 'Company', key: 'company' },
                    { label: 'Drive Date', key: 'date' },
                  ]}
                  rows={upcoming.map((r) => ({
                    company: r.company?.name || r.companyNameCached,
                    date: new Date(r.driveDate).toLocaleString(),
                  }))}
                />
              </div>
            </Card>
          </div>

          <div className="stack">
            <Card title="Quick Actions">
              <div className="quick-actions">
                <a className="btn btn-primary" href="/company/create">
                  + Create Company
                </a>
                <a
                  className="btn btn-secondary"
                  href="/company/create-registration"
                >
                  + Create Drive
                </a>
                <a className="btn btn-secondary" href="/company">
                  Manage Companies
                </a>
              </div>
            </Card>

            <Card title="Batch-wise stats">
              <BarChart
                data={batches.map((b) => ({
                  label: b._id || 'N/A',
                  value: b.placed || 0,
                  total: b.total || 0,
                }))}
                title="Placement Statistics by Batch"
              />
            </Card>
          </div>
        </div>
      </LoadingWrapper>
    );
  }

  // ---------------- STUDENT DASHBOARD ----------------
  return (
    <LoadingWrapper
      isLoading={isLoading}
      skeletonComponent={studentSkeleton}
      loadingMessage="Loading dashboard..."
    >
      <div className="container grid-2">
        {isRefreshing && (
          <div className="auto-refresh-indicator">
            🔄 Checking for updates...
          </div>
        )}

        <div className="stack">
          {/* Placed Card */}
          {placementStatus?.student?.isPlaced && (
            <Card
              title="🎉 Congratulations! You're Placed!"
              className="success-card"
              actions={
                <Button onClick={refreshPlacementStatus} variant="secondary">
                  🔄 Refresh
                </Button>
              }
            >
              <div className="placement-info">
                <h3>
                  Company:{' '}
                  {typeof placementStatus?.student?.placedCompany === 'object'
                    ? placementStatus?.student?.placedCompany?.name
                    : placementStatus?.student?.placedCompany || 'N/A'}
                </h3>

                <p>
                  Placed on:{' '}
                  {placementStatus?.student?.placedAt
                    ? new Date(
                        placementStatus.student.placedAt
                      ).toLocaleDateString()
                    : 'N/A'}
                </p>
                <div className="placement-actions">
                  <p>🎯 You have successfully secured a placement!</p>
                  <p>📧 Check your email for further instructions.</p>
                </div>
              </div>
            </Card>
          )}

          {/* Round Progress */}
          {placementStatus?.roundProgress?.length > 0 && (
            <Card
              title="Round Progress"
              actions={
                <Button onClick={refreshPlacementStatus} variant="secondary">
                  🔄 Refresh
                </Button>
              }
            >
              <div className="round-progress">
                {placementStatus.roundProgress.map((progress, index) => (
                  <div key={index} className="round-item">
                    <div className="round-header">
                      <h4>{progress.companyName}</h4>
                      <span
                        className={`status-badge ${
                          progress.isSelected
                            ? 'selected'
                            : progress.currentRound
                            ? 'in-progress'
                            : 'pending'
                        }`}
                      >
                        {progress.isSelected
                          ? 'Selected'
                          : progress.currentRound
                          ? 'In Progress'
                          : 'Pending'}
                      </span>
                    </div>
                    {progress.currentRound && (
                      <div className="round-details">
                        <p>
                          <strong>Current Round:</strong>{' '}
                          {progress.currentRound.name}
                        </p>
                        <p>
                          <strong>Progress:</strong> Round{' '}
                          {progress.currentRound.index + 1} of{' '}
                          {progress.totalRounds}
                        </p>
                        {progress.currentRound.description && (
                          <p>
                            <strong>Description:</strong>{' '}
                            {progress.currentRound.description}
                          </p>
                        )}
                      </div>
                    )}
                    {progress.isInFinalRound && !progress.isSelected && (
                      <p className="final-round-notice">
                        You're in the final round! Good luck! 🍀
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Placement Status */}
          {user.role === 'student' && (
            <Card
              title="Placement Status"
              actions={
                <Button
                  onClick={refreshPlacementStatus}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? 'Refreshing...' : '🔄 Refresh'}
                </Button>
              }
            >
              {placementStatus?.student?.isPlaced ? (
                <div className="success-card">
                  <div className="placement-info">
                    <h3>🎉 Congratulations! You're Placed!</h3>
                    <p>
                      <strong>Company:</strong>{' '}
                      {typeof placementStatus?.student?.placedCompany ===
                      'object'
                        ? placementStatus?.student?.placedCompany?.name
                        : placementStatus?.student?.placedCompanyName ||
                          placementStatus?.student?.placedCompany ||
                          'N/A'}
                    </p>

                    <p>
                      <strong>Placed on:</strong>{' '}
                      {placementStatus?.student?.placedAt
                        ? new Date(
                            placementStatus.student.placedAt
                          ).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="placement-actions">
                    <p>
                      Share your interview experience to help other students!
                    </p>
                    <a
                      className="btn btn-primary"
                      href="/placed-student/experience"
                    >
                      Write Interview Experience
                    </a>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <p>You are not placed yet.</p>
                  <p>Keep applying and participating in drives!</p>
                </div>
              )}
            </Card>
          )}

          {/* Upcoming */}
          <Card title="Upcoming Companies">
            <div className="table-card">
              <Table
                columns={[
                  { label: 'Company', key: 'company' },
                  { label: 'Drive Date', key: 'date' },
                ]}
                rows={upcoming.map((r) => ({
                  company: r.company?.name || r.companyNameCached,
                  date: new Date(r.driveDate).toLocaleString(),
                }))}
              />
            </div>
          </Card>
        </div>

        {/* Quick Actions & Registered */}
        <div className="stack">
          <Card title="Quick Actions">
            <div className="stack">
              <a className="btn btn-primary" href="/student/profile">
                Edit Profile
              </a>
              <a className="btn btn-secondary" href="/student/profile">
                Upload Resume
              </a>
            </div>
          </Card>

          <Card
            title="Registered Companies"
            actions={
              <Button
                onClick={async () => {
                  if (user._id) {
                    try {
                      const appResponse = await fetch(
                        `/api/users/${user._id}/applications`,
                        { credentials: 'include' }
                      );
                      const appData = await appResponse.json();
                      console.log('Refreshed applications:', appData);
                      setApplications(appData.data || []);
                    } catch (error) {
                      console.error('Failed to refresh applications:', error);
                    }
                    await refreshPlacementStatus();
                  }
                }}
              >
                Refresh All
              </Button>
            }
          >
            <div className="table-card">
              {applications.length === 0 ? (
                <p>
                  No registered companies yet.{' '}
                  <a href="/company">Browse companies</a> to register.
                </p>
              ) : (
                <Table
                  columns={[
                    { label: 'Company', key: 'company' },
                    { label: 'Drive Date', key: 'date' },
                    {
                      label: 'View',
                      render: (r) => (
                        <a
                          className="btn btn-secondary"
                          href={`/company/${encodeURIComponent(r.company)}`}
                        >
                          Open
                        </a>
                      ),
                    },
                  ]}
                  rows={applications.map((a) => ({
                    company:
                      a.registration?.company?.name ||
                      a.registration?.companyNameCached ||
                      '-',
                    date: a.registration?.driveDate
                      ? new Date(a.registration.driveDate).toLocaleString()
                      : '-',
                  }))}
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </LoadingWrapper>
  );
}
