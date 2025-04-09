import { Plugin, normalizePath } from "obsidian";
import { ItemView, WorkspaceLeaf } from "obsidian";
import { mount, unmount } from "svelte";
import Viewer from "src/Viewer.svelte";

interface StatViewerSettings {}

const DEFAULT_SETTINGS: StatViewerSettings = {};

export default class MyPlugin extends Plugin {
  settings: StatViewerSettings;

  async onload() {
    await this.loadSettings();

    // .obsidian/plugins/my-plugin/settings.json へのパスを構築
    const configDir = this.app.vault.configDir;
    const statPath = `${configDir}/vault-stats.json`;
    const normalizedPath = normalizePath(statPath);
    const statsFile = await this.app.vault.adapter.read(normalizedPath);
    const statsJSON = JSON.parse(statsFile);

    this.registerView(
      VIEW_TYPE_EXAMPLE,
      (leaf) => new StatsView(leaf, statsJSON)
    );

    this.addRibbonIcon("dice", "Activate view", () => {
      this.activateView();
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeaf(true);
    await leaf?.setViewState({ type: VIEW_TYPE_EXAMPLE, active: true });
    // "Reveal" the leaf in case it is in a collapsed sidebar
    leaf ? workspace.revealLeaf(leaf) : null;
  }
}

export const VIEW_TYPE_EXAMPLE = "stats-view";

export class StatsView extends ItemView {
  viewer: ReturnType<typeof Viewer> | undefined;
  stats: Object;

  constructor(leaf: WorkspaceLeaf, stats: Object) {
    super(leaf);
    this.stats = stats;
  }

  getViewType() {
    return VIEW_TYPE_EXAMPLE;
  }

  getDisplayText() {
    return "Stats view";
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    this.viewer = mount(Viewer, {
      target: container,
      props: { stats: this.stats },
    });
  }

  async onClose() {
    // Nothing to clean up.
    unmount(Viewer);
  }
}

