import * as dscc from '@google/dscc';
import * as d3 from 'd3';

const LOCAL = false; // set to true only for local testing with sample data below

function drawViz(data) {
  const container = d3.select('#container');
  container.selectAll('*').remove();

  const style = data.style;
  const barColor = style.barColor.value.color;
  const posColor = style.positiveColor.value.color;
  const negColor = style.negativeColor.value.color;
  const connectorColor = style.connectorColor.value.color;
  const currency = style.currencySymbol.value;
  const decimals = parseInt(style.decimals.value, 10) || 0;

  const rows = data.tables.DEFAULT;
  const months = rows.map((r) => r.monthDimension[0]);
  const values = rows.map((r) => Number(r.valueMetric[0]));

  const width = dscc.getWidth();
  const height = dscc.getHeight();

  const margin = { top: 56, right: 20, bottom: 36, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = container
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3
    .scaleBand()
    .domain(months)
    .range([0, innerWidth])
    .padding(0.28);

  const maxVal = d3.max(values) || 1;
  const y = d3
    .scaleLinear()
    .domain([0, maxVal * 1.18])
    .range([innerHeight, 0]);

  // gridlines
  g.append('g')
    .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(() => ''))
    .call((sel) => sel.select('.domain').remove())
    .selectAll('line')
    .attr('stroke', '#e6e6e6');

  g.append('g')
    .call(d3.axisLeft(y).ticks(5).tickFormat((d) => d3.format(',')(d)))
    .call((sel) => sel.select('.domain').remove())
    .selectAll('text')
    .attr('font-size', '11px')
    .attr('fill', '#666');

  // bars
  g.selectAll('.bar')
    .data(values)
    .enter()
    .append('rect')
    .attr('x', (d, i) => x(months[i]))
    .attr('y', (d) => y(d))
    .attr('width', x.bandwidth())
    .attr('height', (d) => innerHeight - y(d))
    .attr('fill', barColor);

  // value labels inside bar
  g.selectAll('.val-label')
    .data(values)
    .enter()
    .append('text')
    .attr('x', (d, i) => x(months[i]) + x.bandwidth() / 2)
    .attr('y', (d) => y(d) + 18)
    .attr('text-anchor', 'middle')
    .attr('fill', '#fff')
    .attr('font-weight', 'bold')
    .attr('font-size', '11px')
    .text((d) => `${Math.round(d).toLocaleString()} ${currency}`);

  // x axis
  g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).tickSize(0))
    .call((sel) => sel.select('.domain').attr('stroke', '#ccc'))
    .selectAll('text')
    .attr('font-size', '11px')
    .attr('fill', '#444');

  // connectors + variance labels
  // this is the part that replaces manual label-dragging in Excel:
  // the label's Y position is derived purely from the SIGN of pct,
  // so it recalculates correctly every time the underlying data changes.
  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1];
    const curr = values[i];
    if (!prev) continue;
    const pct = (curr - prev) / prev;
    const isPos = pct >= 0;
    const color = isPos ? posColor : negColor;

    const xPrevCenter = x(months[i - 1]) + x.bandwidth() / 2;
    const xCurrCenter = x(months[i]) + x.bandwidth() / 2;
    const xMid = (xPrevCenter + xCurrCenter) / 2;

    const yTopPrev = y(prev);
    const yTopCurr = y(curr);
    const yTop = Math.min(yTopPrev, yTopCurr) - 12;
    const yBottom = Math.max(yTopPrev, yTopCurr) + 12;

    g.append('line')
      .attr('x1', xMid).attr('x2', xMid)
      .attr('y1', yTop).attr('y2', yBottom)
      .attr('stroke', connectorColor).attr('stroke-width', 1);
    g.append('line')
      .attr('x1', xMid - 5).attr('x2', xMid + 5)
      .attr('y1', yTop).attr('y2', yTop)
      .attr('stroke', connectorColor).attr('stroke-width', 1);
    g.append('line')
      .attr('x1', xMid - 5).attr('x2', xMid + 5)
      .attr('y1', yBottom).attr('y2', yBottom)
      .attr('stroke', connectorColor).attr('stroke-width', 1);

    // auto-flip: positive -> label above the top cap, negative -> label below the bottom cap
    const labelY = isPos ? yTop - 6 : yBottom + 14;

    g.append('text')
      .attr('x', xMid)
      .attr('y', labelY)
      .attr('text-anchor', 'middle')
      .attr('fill', color)
      .attr('font-weight', 'bold')
      .attr('font-size', '12px')
      .text(`${isPos ? '+' : ''}${(pct * 100).toFixed(decimals)}%`);
  }
}

if (LOCAL) {
  // sample data for local testing without Looker Studio (see README)
  const sample = {
    style: {
      barColor: { value: { color: '#4472C4' } },
      positiveColor: { value: { color: '#2E7D32' } },
      negativeColor: { value: { color: '#C62828' } },
      connectorColor: { value: { color: '#595959' } },
      currencySymbol: { value: '€' },
      decimals: { value: '0' },
    },
    tables: {
      DEFAULT: [
        { monthDimension: ['Iun 25'], valueMetric: [1114] },
        { monthDimension: ['Iul 25'], valueMetric: [1110] },
        { monthDimension: ['Aug 25'], valueMetric: [974] },
        { monthDimension: ['Sept 25'], valueMetric: [947] },
      ],
    },
  };
  drawViz(sample);
} else {
  dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
}
