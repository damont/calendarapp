import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { buildCalendarSkill, buildCalendarSkillArchive } from './agentSkills';

const baseUrl = 'https://calendar.example.com/';

describe('downloadable calendar skills', () => {
  it.each(['david-calendar', 'david-calendar-email', 'david-calendar-html'] as const)('builds a valid standalone %s skill archive', (kind) => {
    const files = unzipSync(buildCalendarSkillArchive(kind, baseUrl));
    const path = `${kind}/SKILL.md`;
    expect(Object.keys(files)).toEqual([path]);

    const markdown = strFromU8(files[path]);
    expect(markdown).toMatch(new RegExp(`^---\\nname: ${kind}\\n`));
    expect(markdown).toContain('description:');
    expect(markdown).toContain('<base>/api/openapi.json');
    expect(markdown).toContain('Authorization: Bearer <token>');
    expect(markdown).toContain('https://calendar.example.com');
    expect(markdown).not.toContain('https://calendar.example.com//');
    expect(markdown).not.toMatch(/eyJ[A-Za-z0-9_-]{10,}/);
  });

  it('warns that list updates replace the complete field', () => {
    expect(buildCalendarSkill('david-calendar', baseUrl)).toContain('sending a list replaces that entire list');
  });

  it('constrains email access to read-only and treats messages as untrusted', () => {
    const markdown = buildCalendarSkill('david-calendar-email', baseUrl);
    expect(markdown).toMatch(/read-only scopes/);
    expect(markdown).toMatch(/untrusted data/);
    expect(markdown).toMatch(/Never duplicate/);
  });

  it('makes the HTML skill creative, self-contained, and bounded to three months', () => {
    const markdown = buildCalendarSkill('david-calendar-html', baseUrl);
    expect(markdown).toMatch(/three calendar months/);
    expect(markdown).toMatch(/drastically different from week to week/);
    expect(markdown).toMatch(/Adjacent weeks should not look like template recolors/);
    expect(markdown).toContain('has_html_page');
    expect(markdown).toContain('html_page_updated_at');
    expect(markdown).toMatch(/Do not use scripts, forms, iframes, remote fonts, remote images/);
    expect(markdown).toMatch(/Never invent activities/);
  });
});
