import { Box, Card, CardHeader, CardContent, Typography, Divider, Skeleton } from '@mui/material'
import { Security as SecurityIcon } from '@mui/icons-material'
import { useRouter } from 'next/router'
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  ReferenceLine,
} from 'recharts'
import { useIsMobileLayout } from '../../hooks/use-breakpoint'

/**
 * Axis configuration for the score trend.
 *
 * Exported because it is the whole of the narrow-screen fix and there is nothing rendered to
 * assert against: recharts reads its axis children's props directly rather than mounting them,
 * so an XAxis cannot be captured by wrapping it.
 *
 * `interval: 0` draws a label for every point. Thirteen dates fit across a desktop card and
 * overlap into one smear at 390px — "Jul 27Jul 28Jul 29". A narrow chart hands spacing back to
 * recharts and lets it drop whatever will not fit.
 */
export const secureScoreAxisProps = ({ isMobile, ticks }) => ({
  x: {
    tick: { fontSize: isMobile ? 10 : 12 },
    tickMargin: 8,
    ticks: isMobile ? undefined : ticks,
    interval: isMobile ? 'preserveStartEnd' : 0,
    minTickGap: isMobile ? 28 : 5,
  },
  y: {
    tick: { fontSize: isMobile ? 10 : 12 },
    tickMargin: 8,
    width: isMobile ? 34 : undefined,
  },
})

export const SecureScoreCard = ({ data, isLoading }) => {
  const router = useRouter()
  const isMobile = useIsMobileLayout()
  return (
    <Card sx={{ flex: 1, height: '100%' }}>
      <CardHeader
        title={
          <Box
            onClick={() => router.push('/tenant/administration/securescore')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              width: 'fit-content',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            <SecurityIcon sx={{ fontSize: 24 }} />
            <Typography variant="h6">Secure Score</Typography>
          </Box>
        }
        sx={{ pb: 1 }}
      />
      <CardContent>
        {isLoading ? (
          <>
            <Box sx={{ height: 250 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
                <Skeleton variant="rectangular" width="100%" height={200} />
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              The Secure Score measures your security posture across your tenant.
            </Typography>
          </>
        ) : !data || !Array.isArray(data) || data.length === 0 ? (
          <>
            <Box sx={{ height: 250 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No secure score data available
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              The Secure Score measures your security posture across your tenant.
            </Typography>
          </>
        ) : (
          <>
            <Box sx={{ height: 250 }}>
              {/* numeric height, recharts warns before its first measure when both sizes are percentages */}
              <ResponsiveContainer width="100%" height="250">
                {(() => {
                  const sortedData = [...data].sort(
                    (a, b) => new Date(a.createdDateTime) - new Date(b.createdDateTime)
                  )
                  const maxScore = Math.max(...sortedData.map((s) => s.maxScore))
                  const chartData = sortedData.map((score) => ({
                    date: new Date(score.createdDateTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    }),
                    score: score.currentScore,
                    percentage: Math.round((score.currentScore / score.maxScore) * 100),
                  }))
                  const ticks = chartData.map((d) => d.date)
                  const axis = secureScoreAxisProps({ isMobile, ticks })
                  return (
                    <LineChart
                      data={chartData}
                      margin={{ left: 12, right: 12, top: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="date" {...axis.x} />
                      <YAxis
                        {...axis.y}
                        domain={[0, maxScore]}
                        tickFormatter={(value) => Math.round(value)}
                      />
                      <ReferenceLine
                        y={maxScore}
                        stroke="#94a3b8"
                        strokeDasharray="0"
                        label={{
                          value: `Max: ${Math.round(maxScore)}`,
                          position: 'insideTopRight',
                          fontSize: 11,
                          fill: '#64748b',
                        }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255,255,255,0.85)',
                          color: 'inherit',
                          border: '1px solid #bbb',
                          borderRadius: '4px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          backdropFilter: 'blur(2px)',
                        }}
                        labelStyle={{
                          color: '#000000',
                        }}
                        formatter={(value, name) => {
                          if (name === 'score') return [value.toFixed(2), 'Score']
                          if (name === 'percentage') return [value + '%', 'Percentage']
                          return value
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={{ fill: '#22c55e', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  )
                })()}
              </ResponsiveContainer>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              The Secure Score measures your security posture across your tenant.
            </Typography>
          </>
        )}
      </CardContent>
      <Divider />
      <CardContent sx={{ pt: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Skeleton width={80} height={60} />
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ flex: 1 }}>
              <Skeleton width={80} height={60} />
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ flex: 1 }}>
              <Skeleton width={80} height={60} />
            </Box>
          </Box>
        ) : !data || !Array.isArray(data) || data.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Enable secure score monitoring in your tenant
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Latest %
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {Math.round(
                  (data[data.length - 1].currentScore / data[data.length - 1].maxScore) * 100
                )}
                %
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Current Score
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {data[data.length - 1].currentScore.toFixed(2)}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Max Score
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {data[data.length - 1].maxScore.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
