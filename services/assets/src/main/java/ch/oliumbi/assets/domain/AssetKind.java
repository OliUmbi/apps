package ch.oliumbi.assets.domain;

public enum AssetKind {
    IMAGE("images"),
    DOCUMENT("documents");

    private final String directory;

    AssetKind(String directory) {
        this.directory = directory;
    }

    public String directory() {
        return directory;
    }
}
